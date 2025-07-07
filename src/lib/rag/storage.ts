import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

import { getEnv } from "../../helpers/get-env";

const QDRANT_URL = getEnv("QDRANT_URL");

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStoreCache = new Map<string, QdrantVectorStore>();

function getOrgCollectionName(orgId: string): string {
  return `org_${orgId}`;
}

export async function createOrgVectorStore(
  orgId: string,
  useCache: boolean = true
): Promise<QdrantVectorStore> {
  const collectionName = getOrgCollectionName(orgId);

  if (useCache && vectorStoreCache.has(collectionName)) {
    return vectorStoreCache.get(collectionName)!;
  }

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    { url: QDRANT_URL, collectionName }
  );

  if (useCache) {
    vectorStoreCache.set(collectionName, vectorStore);
  }

  return vectorStore;
}

export function clearOrgCache(orgId: string) {
  vectorStoreCache.delete(getOrgCollectionName(orgId));
}

export function clearAllCache() {
  vectorStoreCache.clear();
}
