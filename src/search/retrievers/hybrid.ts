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
    private readonly limit: number
  ) {
    this.index = index;
    this.embeddingName = embeddingName;
    this.limit = limit;
  }

  asLambda(result: "text" | "docs" = "text") {
    return RunnableLambda.from(
      async (input: {
        query: string;
        context: Awaited<ReturnType<typeof context.loadRoomContext>>;
      }) => {
        const { query, context } = input;
        const { org, sources } = context;

        const results = await this.retrieve(
          query,
          org.id,
          sources?.map((s: SourcesResponse) => s.id) || []
        );

        if (result === "docs") return results.hits;
        return results.hits.map((hit) => hit.content).join("\n");
      }
    );
  }

  async retrieve(query: string, orgId: string, sourceIds: string[]) {
    return this.index.search(query, {
      hybrid: {
        semanticRatio: 0.8,
        embedder: this.embeddingName,
      },
      filter: `orgId = ${orgId} AND sourceId IN [${sourceIds.join(",")}]`,
      limit: this.limit,
    });
  }
}

export const meiliRetriever = new MeiliRetriever(
  meiliIndex,
  Object.keys(meiliEmbeddings)[0],
  100
);
