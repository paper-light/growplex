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

export async function reindexDocs(
  orgId: string,
  projectId: string,
  docs: DocumentsResponse[]
) {
  await qdrantClient.delete(`org_${orgId}`, {
    wait: true,
    ordering: undefined,
    filter: createDocumentIdsFilter(docs.map((d) => d.id)),
  });

  for (const doc of docs) {
    await pb.collection("documents").update(doc.id, {
      status: DocumentsStatusOptions.loaded,
    });
  }

  await indexDocs(orgId, projectId, docs);
}

export async function indexDocs(
  orgId: string,
  projectId: string,
  docs: DocumentsResponse[]
) {
  for (const doc of docs) {
    try {
      const metrics = await embedder.addTexts(orgId, [
        {
          content: doc.content,
          metadata: {
            ...(doc.metadata as Record<string, any>),
            orgId,
            projectId,
            sourceId: doc.source,
            documentId: doc.id,
          },
        },
      ]);
      await pb.collection("documents").update(doc.id, {
        chunkCount: metrics.documentMetrics[0].chunkCount,
        tokenCount: metrics.documentMetrics[0].tokenCount,
        status: DocumentsStatusOptions.indexed,
      });
    } catch (error) {
      await pb.collection("documents").update(doc.id, {
        status: DocumentsStatusOptions.error,
      });
      log.error({ error }, "Error indexing doc");
    }
  }
}
