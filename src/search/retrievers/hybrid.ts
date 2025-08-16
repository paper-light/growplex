import type { Index } from "meilisearch";

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
