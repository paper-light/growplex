import z from "zod";
import { type ToolRunnableConfig, tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import type { Memory } from "@/shared/ai/memories";

const log = logger.child({
  module: "gateway:ai:oracle:tools",
});

export const UpdateIntegrationAgentSchema = z.object({
  agentId: z.string().describe("The id of the integration agent to update"),
  system: z
    .string()
    .optional()
    .describe(
      "The system prompt of the integration agent. Set only if user is changing behavior of the agent."
    ),
  name: z.string().optional().describe("The name of the integration agent"),
});

export const updateIntegrationAgentTool = tool(
  async (input: any, config: ToolRunnableConfig) => {
    const { agentId, system, name } = UpdateIntegrationAgentSchema.parse(input);
    const { memory } = config.configurable as { memory: Memory };

    try {
      const agent = memory.integration.agents.find((a) => a.id === agentId);
      if (!agent) {
        return {
          success: false,
          content: `Agent not found`,
        };
      }

      const updatedAgent = await pb.collection("agents").update(agent.id, {
        system,
        name,
      });

      log.info({ updatedAgent }, "Updated agent");
      return {
        success: true,
        content: `Updated agent: ${JSON.stringify(updatedAgent)}`,
      };
    } catch (error) {
      log.error({ error }, "Failed to update agent");
      return {
        success: false,
        content: `Failed to update agent: ${error}`,
      };
    }
  },
  {
    schema: UpdateIntegrationAgentSchema,
    name: "update-integration-agent",
    description:
      "Update the integration agent with the given system prompt and name",
    metadata: {
      visible: true,
      needApproval: true,
      autoCancel: true,
      maxWaitSeconds: 60,
    },
  }
);
