import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";

import { getEnv } from "../../helpers/get-env";
import { TextChunkingService } from "./chunker";
import { createProjectFilter, createMultiProjectFilter } from "./filters";

const QDRANT_URL = getEnv("QDRANT_URL");

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export class VectorStorageService {
  private vectorStoreCache = new Map<string, QdrantVectorStore>();

  async createVectorStore(
    collectionName: string,
    useCache: boolean = false
  ): Promise<QdrantVectorStore> {
    if (useCache && this.vectorStoreCache.has(collectionName)) {
      return this.vectorStoreCache.get(collectionName)!;
    }

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: QDRANT_URL,
        collectionName,
      }
    );

    if (useCache) {
      this.vectorStoreCache.set(collectionName, vectorStore);
    }

    return vectorStore;
  }

  getOrgCollectionName(orgId: string): string {
    return `org:${orgId}`;
  }

  async createOrgVectorStore(
    orgId: string,
    useCache: boolean = true
  ): Promise<QdrantVectorStore> {
    const collectionName = this.getOrgCollectionName(orgId);
    return await this.createVectorStore(collectionName, useCache);
  }

  clearOrgCache(orgId: string) {
    const collectionName = this.getOrgCollectionName(orgId);
    this.vectorStoreCache.delete(collectionName);
  }

  clearAllCache() {
    this.vectorStoreCache.clear();
  }
}