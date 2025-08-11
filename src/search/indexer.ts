import { uuidv4 } from "zod";
import type { Document } from "@langchain/core/documents";
import { Index } from "meilisearch";

import { withSimpleRetry } from "@/shared/helpers/with-retry";
import { logger } from "@/shared/lib/logger";

import { Chunker, chunker } from "./chunker";
import { meiliIndex } from "./stores";

const log = logger.child({
  module: "search:indexer",
});

class Indexer {
  constructor(
    private readonly chunker: Chunker,
    private readonly meiliIndex: Index
  ) {
    this.chunker = chunker;
    this.meiliIndex = meiliIndex;
  }

  async indexTexts(text: string[], metadata: Record<string, any>[]) {
    return withSimpleRetry(async () => {
      const docs: Document[] = text.map((text, index) => ({
        pageContent: text,
        metadata: metadata[index],
        id: uuidv4().toString(),
      }));

      const docsChunks = await Promise.all(
        docs.map(async (doc) => {
          const chunks = await this.chunker.splitTextIntoDocuments(
            doc.pageContent,
            doc.metadata
          );
          return chunks;
        })
      );

      const allDocs = docsChunks.flat();
      const chunkCounts = docsChunks.map((docChunks) => docChunks.length);
      const totalTokens = docsChunks.map((docChunks) =>
        docChunks.reduce((acc, chunk) => acc + chunk.metadata.tokenCount, 0)
      );

      const meiliDocs = allDocs.map((doc) => ({
        id: `${doc.metadata.documentId}-${doc.metadata.chunkIndex}`,
        content: doc.pageContent,
        title:
          doc.metadata.title ||
          doc.metadata.url ||
          `${doc.pageContent.slice(0, 100)}...`,
        ...doc.metadata,
      }));

      try {
        const tasks = this.meiliIndex.updateDocumentsInBatches(meiliDocs, 100, {
          primaryKey: "id",
        });
        await Promise.all(tasks);
      } catch (error) {
        log.error({ error }, "Failed to add documents to MeiliSearch");
        throw error;
      }

      return {
        chunkCounts,
        totalTokens,
      };
    });
  }
}

export const indexer = new Indexer(chunker, meiliIndex);
