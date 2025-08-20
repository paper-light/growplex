import z from "zod";
import { type ToolRunnableConfig, tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";

const log = logger.child({
  module: "gateway:ai:oracle:tools",
});

export const UpdateIntegrationAgentSchema = z.object({
  system: z
    .string()
    .optional()
    .describe(
      "The system prompt of the integration agent. This should be specific"
    ),
  name: z.string().optional().describe("The name of the integration agent"),
});

export const updateIntegrationAgentTool = tool(
  async (input: any, config: ToolRunnableConfig) => {
    const { system, name } = UpdateIntegrationAgentSchema.parse(input);
    const memory = config.configurable?.memory as any;

    const updatedAgent = await pb.collection("agents").update(memory.agent.id, {
      system,
      name,
    });

    log.info({ updatedAgent }, "Updated agent");

    return {
      success: true,
      message: `Updated agent: ${JSON.stringify(updatedAgent)}`,
    };
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
