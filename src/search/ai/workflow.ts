import {
  RunnableLambda,
  RunnableParallel,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { logger } from "@/shared/lib/logger";
import { context } from "@/chat/ai/context";

import { enhancerResultToString } from "./enhancer";
import { summaryChain } from "./summary";
import { meiliRetriever } from "../retrievers/hybrid";

const log = logger.child({ module: "search:ai:workflow" });

export const searchChain = RunnableSequence.from([
  // enhancerChain,
  RunnableParallel.from({
    context: context.asLambda(),
    query: enhancerResultToString,
  }),
  RunnableParallel.from({
    args: new RunnablePassthrough(),
    searchResult: meiliRetriever.asLambda("text"),
  }),
  RunnableLambda.from(async (input: { args: any; searchResult: string }) => {
    return { query: input.args.query, searchResult: input.searchResult };
  }),
  summaryChain,
]);
