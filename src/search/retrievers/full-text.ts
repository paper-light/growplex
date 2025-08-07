// import { RunnableLambda } from "@langchain/core/runnables";
// import type { Index } from "meilisearch";
// import { getContextVariable } from "@langchain/core/context";

// import { meiliIndex } from "../storages/meili";
// import type {
//   OrgsResponse,
//   SourcesResponse,
// } from "@/shared/models/pocketbase-types";

// export class FullTextRetriever {
//   constructor(private index: Index) {
//     this.index = index;
//   }

//   asLambda() {
//     return RunnableLambda.from(async (input: string) => {
//       const org: OrgsResponse | undefined = getContextVariable("org");
//       const sources: SourcesResponse[] | undefined =
//         getContextVariable("sources");
//       if (!org || !sources) throw new Error("org or sources is not defined");

//       const results = await this.index.search(input, {
//         filter: [
//           `org_id = ${org.id}`,
//           `source_id IN (${sources.map((s) => s.id).join(",")})`,
//         ],
//       });

//       const re = results.hits.map((hit) => hit.content);

//       return results;
//     });
//   }
// }

// export const fullTextRetriever = new FullTextRetriever(meiliIndex);
