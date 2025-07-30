import { qdrantStorage } from "../storages/qdrant";

export class VectorRetriever {
  async createRetriever(
    orgId: string,
    options: { filter?: any; k?: number } = {}
  ) {
    const vectorStore = await qdrantStorage.createOrgVectorStore(orgId);
    return vectorStore.asRetriever(options);
  }

  async similaritySearch(
    orgId: string,
    query: string,
    k: number,
    filter?: any
  ) {
    const vectorStore = await qdrantStorage.createOrgVectorStore(orgId);
    return await vectorStore.similaritySearchWithScore(query, k, filter);
  }
}

export const vectorRetriever = new VectorRetriever();
