import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import {
  DocumentsStatusOptions,
  type DocumentsResponse,
  type SubscriptionsResponse,
} from "@/shared/models/pocketbase-types";

import { BILLING_GAS_PRICES_PER_TOKEN } from "@/billing/config";
import { BILLING_ERRORS, charger } from "@/billing";
import { chunker } from "@/search/chunker";
import { indexer } from "@/search/indexer";
import { meiliIndex } from "@/search/stores";

const log = logger.child({
  module: "knowledge:index-docs",
});

// only indexed / unsynced docs are reindexed
export async function reindexDocs(sourceId: string, docs: DocumentsResponse[]) {
  const source = await pb
    .collection("sources")
    .getOne(sourceId, { expand: "project" });
  const orgId = (source.expand as any).project.org;

  await meiliIndex.deleteDocuments({
    filter: `orgId = ${orgId} AND sourceId = ${sourceId}`,
  });

  await Promise.all(
    docs.map((doc) =>
      pb.collection("documents").update(doc.id, {
        status: DocumentsStatusOptions.idle,
      })
    )
  );

  await indexDocs(sourceId, docs);
}

// Docs are always not in the knowledge base! Reindex otherwise.
export async function indexDocs(sourceId: string, docs: DocumentsResponse[]) {
  const source = await pb.collection("sources").getOne(sourceId, {
    expand: "project,project.org,project.org.subscription",
  });
  const projectId = source.project;
  const orgId = (source.expand as any).project.org;
  const subscription: SubscriptionsResponse = (source.expand as any).project
    .expand.org.expand.subscription;

  await Promise.all(
    docs.map(async (doc) => {
      const metadata = {
        ...(doc.metadata as Record<string, any>),
        orgId,
        projectId,
        sourceId: doc.source,
        documentId: doc.id,
      };
      await pb.collection("documents").update(doc.id, {
        status: "indexing",
        metadata,
      });

      const docUrl = pb.files.getURL(doc, doc.file);
      const fullContent = await fetch(docUrl).then((res) => res.text());

      try {
        const tokenCount = chunker.countTokens(fullContent);
        const estGasCost =
          BILLING_GAS_PRICES_PER_TOKEN["text-embedding-3-small"].in *
          tokenCount;
        if (subscription.gas < estGasCost)
          throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

        const { chunkCounts, totalTokens } = await indexer.indexTexts(
          [fullContent],
          [metadata]
        );

        await charger.chargeModel(
          subscription.id,
          totalTokens[0],
          "in",
          "text-embedding-3-small"
        );

        await pb.collection("documents").update(doc.id, {
          chunkCount: chunkCounts[0],
          tokenCount: totalTokens[0],
          status: "indexed",
        });
      } catch (error) {
        await pb.collection("documents").update(doc.id, {
          status: "error",
          content: (error as Error).message,
        });
        log.error({ error }, "Error indexing doc");
      }
    })
  );
}
