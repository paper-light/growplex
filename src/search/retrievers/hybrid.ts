import type { Index } from "meilisearch";
import { RunnableLambda } from "@langchain/core/runnables";

import type { context } from "@/chat/ai/context";
import type { SourcesResponse } from "@/shared/models/pocketbase-types";

import { meiliIndex } from "../stores";
import { meiliEmbeddings } from "../embeddings";

class MeiliRetriever {
  constructor(
    private readonly index: Index,
    private readonly embeddingName: string,
    private readonly defaultLimit: number
  ) {
    this.index = index;
    this.embeddingName = embeddingName;
    this.defaultLimit = defaultLimit;
  }

  asLambda(result: "text" | "docs" = "text") {
    return RunnableLambda.from(
      async (input: {
        query: string;
        context: Awaited<ReturnType<typeof context.loadRoomContext>>;
      }) => {
        const { query, context } = input;
        const { org, sources } = context;

        const limit = this.getDynamicLimit(query);
        const results = await this.retrieve(
          query,
          org.id,
          sources?.map((s: SourcesResponse) => s.id) || [],
          limit
        );

        if (result === "docs") return results.hits;
        return results.hits.map((hit) => hit.content).join("\n");
      }
    );
  }

  async retrieve(
    query: string,
    orgId: string,
    sourceIds: string[],
    limit?: number
  ) {
    const searchLimit = limit || this.defaultLimit;
    const results = await this.index.search(query, {
      hybrid: {
        semanticRatio: 0.8,
        embedder: this.embeddingName,
      },
      filter: `orgId = ${orgId} AND sourceId IN [${sourceIds.join(",")}]`,
      limit: searchLimit,
    });

    return {
      ...results,
      hits: results.hits,
    };
  }

  private getDynamicLimit(query: string): number {
    if (query.length > 200) return this.defaultLimit;
    if (query.length > 100) return Math.floor(this.defaultLimit * 0.7);
    return Math.floor(this.defaultLimit * 0.5);
  }
}

export const meiliRetriever = new MeiliRetriever(
  meiliIndex,
  Object.keys(meiliEmbeddings)[0],
  40
);
