import { ToolMessage } from "@langchain/core/messages";

import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { sender } from "@/messages/sender/sender";
import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "@/shared/models/pocketbase-types";

export async function rejectTool(
  msg: MessagesResponse,
  toolCall: any,
  memory: any,
  runConfig: any,
  metadata: any,
  reason: string
) {
  const builtMsg: Partial<MessagesRecord> = {
    content: JSON.stringify({
      success: false,
      error: reason,
    }),
    role: MessagesRoleOptions.assistant,
    visible: metadata.visible,
    room: memory.room.id,
    sentBy: memory.agents[0].id,
    event: toolCall.name,
    metadata: {
      ...(msg.metadata || {}),
      loading: false,
      needApproval: false,
    },
  };

  const updatedMsg = await pbHistoryRepository.replaceMessage(msg.id, builtMsg);

  runConfig.messages = runConfig.messages.map((m: any) => {
    if (m instanceof ToolMessage && m.tool_call_id === toolCall.id) {
      m.status = "error";
      m.content = JSON.stringify({
        success: false,
        error: reason,
      });
    }
    return m;
  });

  if (metadata.visible) {
    sender.sendMessage(memory.room.id, updatedMsg, "update-message");
  }

  return updatedMsg;
}
