import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

const QDRANT_URL = getEnv("QDRANT_URL");
const QDRANT_API_KEY = getEnv("QDRANT_API_KEY");
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

class QdrantStorage {
  private cache: Map<string, QdrantVectorStore>;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.cache = new Map();
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: OPENAI_API_KEY,
    });
  }

  async createOrgVectorStore(
    orgId: string,
    useCache: boolean = true
  ): Promise<QdrantVectorStore> {
    const collectionName = `org_${orgId}`;

    if (useCache && this.cache.has(collectionName))
      return this.cache.get(collectionName)!;

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      {
        url: QDRANT_URL,
        collectionName,
        apiKey: QDRANT_API_KEY,
      }
    );

    if (useCache) this.cache.set(collectionName, vectorStore);
    return vectorStore;
  }

  clearOrgCache(orgId: string) {
    this.cache.delete(`org_${orgId}`);
  }

  clearAllCache() {
    this.cache.clear();
  }
}

export const qdrantStorage = new QdrantStorage();
