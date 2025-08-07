import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

import { getEnv } from "@/shared/helpers/get-env";

import { embeddings } from "../embeddings";

const QDRANT_URL = getEnv("QDRANT_URL");
const QDRANT_API_KEY = getEnv("QDRANT_API_KEY");

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

export const qdrantStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    client: qdrantClient,
    collectionName: "chunks",
    // contentPayloadKey: "content",
    // metadataPayloadKey: "metadata",
  }
);

// class QdrantOrgsStorage {
//   private cache: Map<string, QdrantVectorStore>;
//   private embeddings: OpenAIEmbeddings;

//   constructor() {
//     this.cache = new Map();
//     this.embeddings = new OpenAIEmbeddings({
//       model: "text-embedding-3-small",
//       apiKey: OPENAI_API_KEY,
//     });
//   }

//   async createOrgVectorStore(
//     orgId: string,
//     useCache: boolean = true
//   ): Promise<QdrantVectorStore> {
//     const collectionName = `org_${orgId}`;

//     if (useCache && this.cache.has(collectionName))
//       return this.cache.get(collectionName)!;

//     const vectorStore = await QdrantVectorStore.fromExistingCollection(
//       this.embeddings,
//       {
//         url: QDRANT_URL,
//         collectionName,
//         apiKey: QDRANT_API_KEY,
//       }
//     );

//     if (useCache) this.cache.set(collectionName, vectorStore);
//     return vectorStore;
//   }

//   clearOrgCache(orgId: string) {
//     this.cache.delete(`org_${orgId}`);
//   }

//   clearAllCache() {
//     this.cache.clear();
//   }
// }

// export const qdrantStorage = new QdrantStorage();
