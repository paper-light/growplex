import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import {
  DocumentsStatusOptions,
  type DocumentsResponse,
  type SubscriptionsResponse,
} from "@/shared/models/pocketbase-types";

import { qdrantStore } from "@/search/stores";
import {
  createDocumentIdsFilter,
  createOrgFilter,
  mergeFilters,
} from "@/search/filters";
import { BILLING_GAS_PRICES_PER_TOKEN } from "@/billing/config";
import { BILLING_ERRORS, charger } from "@/billing";
import { chunker } from "@/search/chunker";
import { indexer } from "@/search/indexer";

const log = logger.child({
  module: "knowledge:index-docs",
});

export async function reindexDocs(sourceId: string, docs: DocumentsResponse[]) {
  const source = await pb
    .collection("sources")
    .getOne(sourceId, { expand: "project" });
  const orgId = (source.expand as any).project.org;

  await qdrantStore.delete({
    filter: mergeFilters([
      createOrgFilter(orgId),
      createDocumentIdsFilter(docs.map((d) => d.id)),
    ]),
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
      const docIndexed = doc.status === "indexed" || doc.status === "unsynced";

      const metadata = {
        ...(doc.metadata as Record<string, any>),
        orgId,
        projectId,
        sourceId: doc.source,
        documentId: doc.id,
      };

      try {
        const tokenCount = chunker.countTokens(doc.content);
        const estGasCost =
          BILLING_GAS_PRICES_PER_TOKEN["text-embedding-3-small"].in *
          tokenCount;
        if (subscription.gas < estGasCost)
          throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

        await pb.collection("documents").update(doc.id, {
          status: docIndexed ? "indexed" : "indexing",
          metadata,
        });

        const { chunkCounts, totalTokens } = await indexer.indexTexts(
          [doc.content],
          [metadata]
        );

        await charger.charge(
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
          status: docIndexed ? "indexed" : "error",
          content: docIndexed ? doc.content : (error as Error).message,
        });
        log.error({ error }, "Error indexing doc");
      }
    })
  );
}
