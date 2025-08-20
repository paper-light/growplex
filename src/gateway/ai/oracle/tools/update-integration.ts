import z from "zod";
import { type ToolRunnableConfig, tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { themes } from "@/shared/styles/themes";
import { pb } from "@/shared/lib/pb";

const log = logger.child({
  module: "gateway:ai:oracle:tools",
});

export const UpdateIntegrationSchema = z.object({
  name: z.string().optional().describe("The name of the integration chat"),
  addAgents: z
    .array(z.string())
    .optional()
    .describe("The agent ids to add to the integration"),
  removeAgents: z
    .array(z.string())
    .optional()
    .describe("The agent ids to remove from the integration"),
  addKnowledgeSources: z
    .array(z.string())
    .optional()
    .describe("The knowledge source ids to add to the integration"),
  removeKnowledgeSources: z
    .array(z.string())
    .optional()
    .describe("The knowledge source ids to remove from the integration"),
  addChats: z
    .array(z.string())
    .optional()
    .describe("The chat ids to add to the integration"),
  removeChats: z
    .array(z.string())
    .optional()
    .describe("The chat ids to remove from the integration"),
  addOperators: z
    .array(z.string())
    .optional()
    .describe("The operator ids to add to the integration"),
  removeOperators: z
    .array(z.string())
    .optional()
    .describe("The operator ids to remove from the integration"),
});

export const updateIntegrationTool = tool(
  async (input: any, config: ToolRunnableConfig) => {
    const {
      name,
      addAgents,
      removeAgents,
      addOperators,
      removeOperators,
      addKnowledgeSources,
      removeKnowledgeSources,
      addChats,
      removeChats,
    } = UpdateIntegrationSchema.parse(input);
    const memory = config.configurable?.memory as any;

    const updatedIntegration = await pb
      .collection("integrations")
      .update(memory.integration.id, {
        name,
        "agents+": addAgents,
        "agents-": removeAgents,
        "sources+": addKnowledgeSources,
        "sources-": removeKnowledgeSources,
        "operators+": addOperators,
        "operators-": removeOperators,
      });

    for (const chatId of addChats ?? []) {
      await pb.collection("chats").update(chatId, {
        integration: memory.integration.id,
      });
    }

    for (const chatId of removeChats ?? []) {
      await pb.collection("chats").update(chatId, {
        integration: null,
      });
    }

    log.info({ updatedIntegration }, "Updated integration");

    return {
      success: true,
      message: `Updated integration: ${JSON.stringify(updatedIntegration)}`,
    };
  },
  {
    schema: UpdateIntegrationSchema,
    name: "update-integration-chat",
    description:
      "Update the integration chat with the given domain, theme, name, and first message",
    metadata: {
      visible: true,
      needApproval: true,
      autoCancel: true,
      maxWaitSeconds: 60,
    },
  }
);
