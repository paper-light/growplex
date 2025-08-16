import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import type { Usager } from "@/billing/usager";
import { EnhancerReturnSchema } from "@/search/ai/enhancer/schemas";
import { runSearchWorkflow } from "@/search/ai/searcher/workflows";

import type { ConsulterMemory } from "../memories";
import type { WorkflowConfig } from "../workflows";

const log = logger.child({ module: "chat:ai:tools:call-search-agent" });

export const callSearchChain = tool(
  async (input: any, config: RunnableConfig) => {
    const args = EnhancerReturnSchema.parse(input);
    const { memory, usager, workflowConfig } = config.configurable as {
      memory: ConsulterMemory;
      usager: Usager;
      workflowConfig: WorkflowConfig;
    };

    const { result } = await runSearchWorkflow(
      memory.room.id,
      args,
      usager,
      memory
    );

    result.content = result.success
      ? JSON.stringify({
          content: "✅ Found relevant information for your question",
          success: true,
        })
      : JSON.stringify({
          content: "❌ No relevant information found",
          success: false,
        });

    workflowConfig.knowledge = JSON.stringify(
      `Relevant to query: ${result.success ? "✅" : "❌"}
      Search results: ${result.content}`
    );
    workflowConfig.withSearch = false;

    return result;
  },
  {
    name: "callSearchAgent",
    description:
      "Search knowledge base for factual questions requiring current information or data not in chat history.",
    schema: EnhancerReturnSchema,
    metadata: {
      visible: true,
    },
  }
);
