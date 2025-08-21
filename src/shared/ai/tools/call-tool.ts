import { z } from "zod";
import { ToolMessage } from "@langchain/core/messages";
import type { StructuredTool } from "@langchain/core/tools";

import type { Usager } from "@/billing/usager";
import {
  MessagesRoleOptions,
  type AgentsResponse,
} from "@/shared/models/pocketbase-types";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { sender } from "@/messages/sender/sender";
import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";

import type { Memory } from "../memories";

import { rejectTool } from "./reject-tool";
import { msgWait } from "./msg-wait";
import { approveTool } from "./approve-tool";

const log = logger.child({ module: "shared:ai:tools:call-tool" });

export const ToolMetadata = z.object({
  needApproval: z.boolean().default(false),
  visible: z.boolean().default(false),
  maxWaitSeconds: z.number().default(30),
  autoCancel: z.boolean().default(true),
});

export async function callTool(
  tool: StructuredTool,
  toolCall: any,
  memory: Memory,
  agent: AgentsResponse,
  runConfig: any,
  usager: Usager
) {
  const toolMetadata = ToolMetadata.parse(tool.metadata);
  const msgMetadata = {
    toolCallId: toolCall.id,
    loading: true,
    toolName: tool.name,
    needApproval: toolMetadata.needApproval,
    visible: toolMetadata.visible,
    args: toolCall.args,
    waitingSeconds: toolMetadata.maxWaitSeconds,
  };

  // Create pending message
  const pbMessages = await pbHistoryRepository.updateHistory([
    {
      content: "<PROMISE>",
      role: MessagesRoleOptions.tool,
      metadata: msgMetadata,
      room: memory.room.room.id,
      sentBy: agent.id,
      visible: msgMetadata.visible,
      event: toolCall.name,
    },
  ]);
  runConfig.messages.push(
    new ToolMessage({
      content: "<PROMISE WAITING>",
      status: "success",
      tool_call_id: toolCall.id,
      metadata: msgMetadata,
    })
  );
  if (msgMetadata.visible) {
    sender.sendMessage(memory.room.room.id, pbMessages[0], "new-message");
  }

  if (toolMetadata.needApproval) {
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(async () => {
          pb.collection("messages").unsubscribe(pbMessages[0].id);

          if (toolMetadata.autoCancel) {
            await rejectTool(
              pbMessages[0].id,
              toolCall,
              memory,
              agent,
              runConfig,
              msgMetadata,
              "Tool was not approved by user"
            );
          }
        }, toolMetadata.maxWaitSeconds * 1000);

        pb.collection("messages").subscribe(pbMessages[0].id, (e) =>
          msgWait(
            e,
            timeout,
            resolve,
            reject,
            pbMessages[0],
            tool,
            toolCall,
            memory,
            agent,
            runConfig,
            usager
          )
        );
      });
    } catch (error) {
      log.error({ error }, "Failed to wait for approval");
    }
  } else {
    await approveTool(
      tool,
      toolCall,
      pbMessages[0].id,
      memory,
      agent,
      msgMetadata,
      runConfig,
      usager
    );
  }
}
