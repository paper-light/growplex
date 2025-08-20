import z from "zod";
import { type ToolRunnableConfig, tool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";
import { themes } from "@/shared/styles/themes";
import { pb } from "@/shared/lib/pb";

const log = logger.child({
  module: "gateway:ai:oracle:tools",
});

export const UpdateIntegrationChatSchema = z.object({
  domain: z
    .string()
    .optional()
    .describe(
      "The domain of the integration chat. This should be a domain of the website that the user wants to integrate"
    ),
  theme: z
    .enum(themes)
    .optional()
    .describe("The UI theme of the integration chat"),
  name: z.string().optional().describe("The name of the integration chat"),
  firstMessage: z
    .string()
    .optional()
    .describe(
      "The first message of the integration chat. This should be a message that sent first by chat"
    ),
});

export const updateIntegrationChatTool = tool(
  async (input: any, config: ToolRunnableConfig) => {
    const { domain, theme, name, firstMessage } =
      UpdateIntegrationChatSchema.parse(input);
    const memory = config.configurable?.memory as any;

    const updatedChat = await pb.collection("chats").update(memory.chat.id, {
      domain,
      theme,
      name,
      firstMessage,
    });

    log.info({ updatedChat }, "Updated chat");

    return {
      success: true,
      message: `Updated chat: ${JSON.stringify(updatedChat)}`,
    };
  },
  {
    schema: UpdateIntegrationChatSchema,
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
