import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { EnhancerReturnSchema } from "@/search/ai/enhancer/schemas";
import { runSearchWorkflow } from "@/search/ai/searcher/workflows";
import type { Model, ModelUsage } from "@/billing/types";

import type { ConsulterMemory } from "../memories";
import type { WorkflowConfig } from "../workflows";

const log = logger.child({ module: "chat:ai:tools:call-search-agent" });

export const callSearchAgent = tool(
  async (input: any, config: RunnableConfig) => {
    const args = EnhancerReturnSchema.parse(input);
    const { memory, updateWorkflowConfig, updateUsager } =
      config.configurable as {
        memory: ConsulterMemory;
        updateWorkflowConfig: (config: Partial<WorkflowConfig>) => void;
        updateUsager: (usage: Record<Model, ModelUsage>) => void;
      };

    const { result, usage } = await runSearchWorkflow(
      memory.room.id,
      args,
      memory
    );

    updateWorkflowConfig({
      knowledge: JSON.stringify(
        `Relevant to query: ${result.success ? "✅" : "❌"}
      Search results: ${result.content}`
      ),
      withSearch: false,
    });

    result.content = result.success
      ? "✅ Found relevant information for your question"
      : "❌ No relevant information found";

    updateUsager(usage);

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
