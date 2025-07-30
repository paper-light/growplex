import { getContextVariable } from "@langchain/core/context";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";

import { enhancerChain, enhancerResultToString } from "./enhancer";
import { summaryChain } from "./summary";
import { vectorRetriever } from "../retrievers/vector";
import { logger } from "@/shared/lib/logger";

const log = logger.child({ module: "search:ai:workflow" });

export const searchChain = RunnableSequence.from([
  enhancerChain,
  enhancerResultToString,
  vectorRetriever.asLambda(),
  summaryChain,
]);

export const searchChainWithContext = RunnableLambda.from(async () => {
  const history = getContextVariable("history");
  const query = getContextVariable("query");
  log.info(
    {
      query,
      historyLength: Array.isArray(history) ? history.length : undefined,
    },
    "Invoking searchChain"
  );
  const result = await searchChain.invoke({
    history,
    query,
  });
  log.debug({ result }, "searchChain result");
  return result;
});
