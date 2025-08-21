import { ToolMessage } from "@langchain/core/messages";
import type { StructuredTool } from "@langchain/core/tools";

import type { AgentsResponse } from "@/shared/models/pocketbase-types";
import type { Usager } from "@/billing/usager";
import { logger } from "@/shared/lib/logger";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { sender } from "@/messages/sender/sender";
import type { Model, ModelUsage } from "@/billing/types";
import type { Memory } from "../memories";

const log = logger.child({ module: "shared:ai:tools:approve-tool" });

export async function approveTool(
  tool: StructuredTool,
  toolCall: any,
  msgId: string,
  memory: Memory,
  agent: AgentsResponse,
  metadata: any,
  runConfig: any,
  usager: Usager
) {
  const roomId = memory.room.room.id;
  // Execute the actual tool call
  const toolMessage: ToolMessage = await tool.invoke(toolCall, {
    configurable: {
      memory,
      updateRunConfig: (config: any) => {
        Object.assign(runConfig, config);
      },
      updateUsager: (usage: Record<Model, ModelUsage>) => {
        usager.updateByUsage(usage);
      },
    },
  });

  runConfig.messages = runConfig.messages.map((m: any) => {
    if (m instanceof ToolMessage && m.tool_call_id === toolCall.id) {
      return toolMessage;
    }
    return m;
  });

  // Update the promise message with the tool result
  const builtMsgs = historyLangchainAdapter.buildPBHistory([
    {
      msg: toolMessage,
      opts: {
        roomId,
        agent,
        visible: metadata.visible,
      },
    },
  ]);
  builtMsgs[0].metadata = {
    ...(metadata || {}),
    approved: true,
    loading: false,
  };
  const updatedMsg = await pbHistoryRepository.replaceMessage(
    msgId,
    builtMsgs[0]
  );

  if (metadata.visible) {
    sender.sendMessage(roomId, updatedMsg, "update-message");
  }

  return updatedMsg;
}
