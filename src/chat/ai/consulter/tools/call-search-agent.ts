import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";

import { searchChain } from "@/search/ai/workflow";
import { EnhancerReturnSchema } from "@/search/ai/enhancer";
import { logger } from "@/shared/lib/logger";

const log = logger.child({ module: "chat:ai:tools:call-search-agent" });

export const callSearchChain = tool(
  async (input: any, config: RunnableConfig) => {
    const args = EnhancerReturnSchema.parse(input);
    const { roomId } = config.configurable || {};

    const result = await searchChain.invoke({
      ...args,
      roomId,
    });

    const usage = (result.raw as any).usage_metadata;
    log.debug({ usage }, "searchChain usage");

    return { result: result.parsed, usage };
  },
  {
    name: "callSearchChain",
    description:
      "Search knowledge base for factual questions requiring current information or data not in chat history.",
    schema: EnhancerReturnSchema,
    metadata: {
      visible: false,
    },
  }
);
