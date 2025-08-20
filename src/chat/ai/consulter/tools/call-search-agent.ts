import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { EnhancerReturnSchema } from "@/search/ai/enhancer/schemas";
import { runSearcher } from "@/search/ai/searcher/run";
import type { Model, ModelUsage } from "@/billing/types";

import type { RoomMemory } from "@/shared/ai/memories/load-room-memory";
import type { RunConsulterConfig } from "../run";

const log = logger.child({ module: "chat:ai:tools:call-search-agent" });

export const callSearchAgent = tool(
  async (input: any, config: RunnableConfig) => {
    const args = EnhancerReturnSchema.parse(input);
    const { memory, updateRunConfig, updateUsager } = config.configurable as {
      memory: RoomMemory;
      updateRunConfig: (config: Partial<RunConsulterConfig>) => void;
      updateUsager: (usage: Record<Model, ModelUsage>) => void;
    };

    const { result, usage } = await runSearcher(memory.room.id, args, memory);

    updateRunConfig({
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
      needApproval: false,
    },
  }
);
