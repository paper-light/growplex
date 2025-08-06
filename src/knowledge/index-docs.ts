import { embedder } from "@/search/embedder";
import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import {
  DocumentsStatusOptions,
  type DocumentsResponse,
} from "@/shared/models/pocketbase-types";
import { qdrantClient } from "@/shared/lib/qdrant";
import { createDocumentIdsFilter } from "@/search/filters";

const log = logger.child({
  module: "knowledge:index-docs",
});

export async function reindexDocs(sourceId: string, docs: DocumentsResponse[]) {
  const source = await pb
    .collection("sources")
    .getOne(sourceId, { expand: "project" });
  const orgId = (source.expand as any).project.org;

  await qdrantClient.delete(`org_${orgId}`, {
    wait: true,
    ordering: undefined,
    filter: createDocumentIdsFilter(docs.map((d) => d.id)),
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
  const source = await pb
    .collection("sources")
    .getOne(sourceId, { expand: "project" });
  const projectId = source.project;
  const orgId = (source.expand as any).project.org;

  await Promise.all(
    docs.map(async (doc) => {
      const docIndexed = doc.status === "indexed";
      const metadata = {
        ...(doc.metadata as Record<string, any>),
        orgId,
        projectId,
        sourceId: doc.source,
        documentId: doc.id,
      };

      try {
        await pb.collection("documents").update(doc.id, {
          status: docIndexed ? "indexed" : "indexing",
          metadata,
        });

        const metrics = await embedder.addTexts(orgId, [
          {
            content: doc.content,
            metadata,
          },
        ]);

        await pb.collection("documents").update(doc.id, {
          chunkCount: metrics.documentMetrics[0].chunkCount,
          tokenCount: metrics.documentMetrics[0].tokenCount,
          status: "indexed",
        });
      } catch (error) {
        await pb.collection("documents").update(doc.id, {
          status: docIndexed ? "indexed" : "error",
        });
        log.error({ error }, "Error indexing doc");
      }
    })
  );
}
