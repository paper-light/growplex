import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

import { getEnv } from "../shared/helpers/get-env";

const QDRANT_URL = getEnv("QDRANT_URL");
const QDRANT_API_KEY = getEnv("QDRANT_API_KEY");

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStoreCache = new Map<string, QdrantVectorStore>();

// -------------------------PUBLIC-------------------------

export async function createOrgVectorStore(
  orgId: string,
  useCache: boolean = true
): Promise<QdrantVectorStore> {
  const collectionName = getOrgCollectionName(orgId);

  if (useCache && vectorStoreCache.has(collectionName))
    return vectorStoreCache.get(collectionName)!;

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: QDRANT_URL,
      collectionName,
      apiKey: QDRANT_API_KEY,
    }
  );

  if (useCache) vectorStoreCache.set(collectionName, vectorStore);
  return vectorStore;
}

export function clearOrgCache(orgId: string) {
  vectorStoreCache.delete(getOrgCollectionName(orgId));
}

export function clearAllCache() {
  vectorStoreCache.clear();
}

// -------------------------PRIVATE-------------------------

function getOrgCollectionName(orgId: string): string {
  return `org_${orgId}`;
}
