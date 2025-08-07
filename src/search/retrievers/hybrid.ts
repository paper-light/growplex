// import { getContextVariable } from "@langchain/core/context";
// import { RunnableLambda } from "@langchain/core/runnables";
// import type { QdrantClient } from "@qdrant/js-client-rest";

// import { embeddings } from "../embeddings";
// import { createOrgFilter, createSourcesFilter, mergeFilters } from "../filters";
// import { qdrantClient } from "../stores/qdrant";
// import type {
//   OrgsResponse,
//   SourcesResponse,
// } from "@/shared/models/pocketbase-types";

// const ALPHA = 0.75;
// const CHUNKS_LIMIT = 100;

// export class HybridRetriever {
//   constructor(private qdrantClient: QdrantClient) {}

//   asLambda() {
//     return RunnableLambda.from(async (input: string) => {
//       const org: OrgsResponse | undefined = getContextVariable("org");
//       const sources: SourcesResponse[] | undefined =
//         getContextVariable("sources");

//       if (!org || !sources) throw new Error("org or sources is not defined");

//       const results = await this.hybridSearch({
//         query: input,
//         orgId: org.id,
//         sourceIds: sources.map((s) => s.id),
//         limit: CHUNKS_LIMIT,
//       });

//       return results;
//     });
//   }

//   async hybridSearch({
//     query,
//     orgId,
//     sourceIds,
//     limit,
//   }: {
//     query: string;
//     orgId: string;
//     sourceIds: string[];
//     limit: number;
//   }) {
//     const embedding = await embeddings.embedQuery(query);

//     const results = await this.qdrantClient.search("chunks", {
//       vector: embedding,
//       limit,
//       with_payload: true,
//       with_vector: true,
//       params: {
//         score_fusion_type: "max",
//         score_fusion_ratio: ALPHA,
//       },
//       filter: mergeFilters([
//         createOrgFilter(orgId),
//         createSourcesFilter(sourceIds),
//       ]),
//     });

//     return results;
//   }
// }

// export const hybridRetriever = new HybridRetriever(qdrantClient);
