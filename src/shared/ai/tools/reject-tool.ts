import { ToolMessage } from "@langchain/core/messages";

import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { sender } from "@/messages/sender/sender";
import {
  MessagesRoleOptions,
  type AgentsResponse,
  type MessagesRecord,
} from "@/shared/models/pocketbase-types";

import type { Memory } from "../memories";

export async function rejectTool(
  msgId: string,
  toolCall: any,
  memory: Memory,
  agent: AgentsResponse,
  runConfig: any,
  metadata: any,
  reason: string
) {
  const roomId = memory.room.room.id;

  const builtMsg: Partial<MessagesRecord> = {
    content: JSON.stringify({
      success: false,
      content: reason,
    }),
    role: MessagesRoleOptions.tool,
    visible: metadata.visible,
    room: roomId,
    sentBy: agent.id,
    event: toolCall.name,
    metadata: {
      ...(metadata || {}),
      rejected: true,
      loading: false,
    },
  };

  const updatedMsg = await pbHistoryRepository.replaceMessage(msgId, builtMsg);

  runConfig.messages = runConfig.messages.map((m: any) => {
    if (m instanceof ToolMessage && m.tool_call_id === toolCall.id) {
      m.status = "error";
      m.content = JSON.stringify({
        success: false,
        content: reason,
      });
    }
    return m;
  });

  if (metadata.visible) {
    sender.sendMessage(roomId, updatedMsg, "update-message");
  }

  return updatedMsg;
}
