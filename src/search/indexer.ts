import { uuidv4 } from "zod";
import type { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";

import { withSimpleRetry } from "@/shared/helpers/with-retry";

import { Chunker, chunker } from "./chunker";
import { qdrantStore } from "./stores";

class Indexer {
  private store: QdrantVectorStore;
  private chunker: Chunker;
  constructor(store: QdrantVectorStore, chunker: Chunker) {
    this.store = store;
    this.chunker = chunker;
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

      const chunkCounts = docsChunks.map((docChunks) => docChunks.length);

      await this.store.addDocuments(docsChunks.flat());

      return {
        chunkCounts,
      };
    });
  }
}

export const indexer = new Indexer(qdrantStore, chunker);
