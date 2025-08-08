import type { QdrantVectorStore } from "@langchain/qdrant";
import { RunnableLambda } from "@langchain/core/runnables";

import { context } from "@/chat/ai/context";
import type { SourcesResponse } from "@/shared/models/pocketbase-types";

import { qdrantStore } from "../stores";
import { createOrgFilter, createSourcesFilter, mergeFilters } from "../filters";

const CHUNKS_COUNT = 100;

export class SemanticRetriever {
  constructor(private vectoreStore: QdrantVectorStore) {
    this.vectoreStore = vectoreStore;
  }

  asLambda(result: "text" | "docs" = "text") {
    return RunnableLambda.from(
      async (input: {
        query: string;
        context: Awaited<ReturnType<typeof context.loadRoomContext>>;
      }) => {
        const { query, context } = input;
        const { org, sources } = context;

        const filters = mergeFilters([
          createOrgFilter(org.id),
          createSourcesFilter(sources?.map((s: SourcesResponse) => s.id) || []),
        ]);

        const retriever = this.vectoreStore.asRetriever({
          k: CHUNKS_COUNT,
          ...(Object.keys(filters).length > 0 && { filter: filters }),
        });

        const docs = await retriever.invoke(query);

        if (result === "docs") return docs;

        return docs.map((d) => d.pageContent).join("\n");
      }
    );
  }
}

export const semanticRetriever = new SemanticRetriever(qdrantStore);
