import { RunnableLambda } from "@langchain/core/runnables";

import { qdrantStorage } from "../storages/qdrant";
import { getContextVariable } from "@langchain/core/context";
import type {
  OrgsResponse,
  SourcesResponse,
} from "@/shared/models/pocketbase-types";

import { createSourcesFilter } from "../filters";

export class VectorRetriever {
  asLambda() {
    return RunnableLambda.from(async (input: string) => {
      const org: OrgsResponse | undefined = getContextVariable("org");
      const sources: SourcesResponse[] | undefined =
        getContextVariable("sources");

      if (!org || !sources) {
        throw new Error("org or sources is not defined");
      }

      const retriever = await vectorRetriever.createRetriever(org.id, {
        k: 50,
        filter: createSourcesFilter(sources.map((s) => s.id)),
      });

      const docs = await retriever.invoke(input);
      const results = docs.map((doc) => doc.pageContent).join("\n");

      return { results, query: input };
    });
  }

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
