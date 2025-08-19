import type { StructuredTool } from "@langchain/core/tools";

import {
  MessagesRoleOptions,
  type MessagesRecord,
} from "@/shared/models/pocketbase-types";

import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { ToolMessage } from "@langchain/core/messages";
import type { Usager } from "@/billing/usager";
import type { Model, ModelUsage } from "@/billing/types";
import { sender } from "@/messages/sender/sender";
import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";

import type { ConsulterMemory } from "../memories";
import type { WorkflowConfig } from "../workflows";

import { callSearchAgent } from "./call-search-agent";
import { updateLead } from "./update-lead";
import { createTicket } from "./create-ticket";
import { callOperator } from "./call-operator";

const log = logger.child({ module: "chat:ai:consulter:tools" });

export const chatTools: StructuredTool[] = [
  updateLead,
  createTicket,
  callOperator,
  callSearchAgent,
];

export const chatToolsMap = chatTools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, StructuredTool>);

export const callTool = async (
  toolCall: any,
  memory: ConsulterMemory,
  workflowConfig: WorkflowConfig,
  usager: Usager
) => {
  const metadata = {
    toolCallId: toolCall.id,
    loading: true,
    toolName: toolCall.name,
    needApproval: false,
    visible: ["callSearchAgent", "callOperator"].includes(toolCall.name),
  };

  const pbMessages = await pbHistoryRepository.updateHistory([
    {
      content: "<PROMISE>",
      role: MessagesRoleOptions.tool,
      metadata,
      room: memory.room.id,
      sentBy: memory.agent.id,
      visible: metadata.visible,
      event: toolCall.name,
    },
  ]);

  workflowConfig.messages.push(
    new ToolMessage({
      content: "<PROMISE WAITING>",
      status: "success",
      tool_call_id: toolCall.id,
      metadata,
    })
  );

  if (metadata.visible) {
    sender.sendMessage(memory.room.id, pbMessages[0], "new-message");
  }

  if (metadata.needApproval) {
    const maxWaitSeconds = 120;
    const autoCancel = true;

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(async () => {
          metadata.needApproval = false;
          pb.collection("messages").unsubscribe(pbMessages[0].id);

          if (autoCancel) {
            try {
              await rejectTool(
                toolCall,
                memory,
                workflowConfig,
                pbMessages,
                metadata,
                "Tool was not approved by user"
              );
            } catch (error) {
              log.error({ error }, "Failed to update message on timeout");
            }
          }

          resolve();
        }, maxWaitSeconds * 1000);

        pb.collection("messages").subscribe(pbMessages[0].id, async (e) => {
          log.debug({ e }, "Tool update event for tool call");
          switch (e.action) {
            case "update":
              const metadata = e.record.metadata as any;
              if (metadata.rejected) {
                clearTimeout(timeout);
                pb.collection("messages").unsubscribe(pbMessages[0].id);

                try {
                  await rejectTool(
                    toolCall,
                    memory,
                    workflowConfig,
                    pbMessages,
                    metadata,
                    "Tool was rejected by user"
                  );
                } catch (error) {
                  log.error({ error }, "Failed to update message on rejection");
                }

                reject(new Error("Tool was rejected by user"));
                return;
              }

              if (metadata.approved) {
                clearTimeout(timeout);
                pb.collection("messages").unsubscribe(pbMessages[0].id);

                try {
                  await approveTool(
                    toolCall,
                    memory,
                    pbMessages,
                    metadata,
                    workflowConfig,
                    usager
                  );
                } catch (error) {
                  log.error({ error }, "Failed to execute tool on approval");
                }

                resolve();
              }
              break;
            case "delete":
              clearTimeout(timeout);
              pb.collection("messages").unsubscribe(pbMessages[0].id);
              reject(
                new Error("Message was deleted while waiting for approval")
              );
              break;
            default:
              log.debug({ e }, `Received action: ${e.action}`);
              break;
          }
        });
      });
    } catch (error) {
      log.error({ error }, "Failed to wait for approval");

      if (
        error instanceof Error &&
        error.message === "Tool was rejected by user"
      ) {
        log.debug("Tool was rejected by user, stopping execution");
        return;
      }

      throw error;
    }
  } else {
    await approveTool(
      toolCall,
      memory,
      pbMessages,
      metadata,
      workflowConfig,
      usager
    );
  }
};

async function rejectTool(
  toolCall: any,
  memory: ConsulterMemory,
  workflowConfig: WorkflowConfig,
  pbMessages: any[],
  metadata: any,
  reason: string
) {
  const msg: Partial<MessagesRecord> = {
    content: JSON.stringify({
      success: false,
      error: reason,
    }),
    role: MessagesRoleOptions.assistant,
    visible: metadata.visible,
    room: memory.room.id,
    sentBy: memory.agent.id,
    event: toolCall.name,
    metadata: {
      ...(pbMessages[0].metadata || {}),
      loading: false,
      needApproval: false,
    },
  };

  const updatedMsg = await pbHistoryRepository.replaceMessage(
    pbMessages[0].id,
    msg
  );

  workflowConfig.messages = workflowConfig.messages.map((m) => {
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

async function approveTool(
  toolCall: any,
  memory: ConsulterMemory,
  pbMessages: any[],
  metadata: any,
  workflowConfig: WorkflowConfig,
  usager: Usager
) {
  // Execute the actual tool call
  const toolMessage: ToolMessage = await chatToolsMap[toolCall.name].invoke(
    toolCall,
    {
      configurable: {
        memory,
        updateWorkflowConfig: (config: Partial<WorkflowConfig>) => {
          Object.assign(workflowConfig, config);
        },
        updateUsager: (usage: Record<Model, ModelUsage>) => {
          usager.updateByUsage(usage);
        },
      },
    }
  );

  workflowConfig.messages = workflowConfig.messages.map((m) => {
    if (m instanceof ToolMessage && m.tool_call_id === toolCall.id) {
      return toolMessage;
    }
    return m;
  });

  // Update the promise message with the tool result
  const updatedMessages = historyLangchainAdapter.buildPBHistory([
    {
      msg: toolMessage,
      opts: {
        roomId: memory.room.id,
        agent: memory.agent,
        visible: metadata.visible,
      },
    },
  ]);

  const msg = updatedMessages[0];
  msg.metadata = {
    ...(msg.metadata || {}),
    loading: false,
    needApproval: false,
  };

  const updatedMsg = await pbHistoryRepository.replaceMessage(
    pbMessages[0].id,
    msg
  );

  if (metadata.visible) {
    sender.sendMessage(memory.room.id, updatedMsg, "update-message");
  }

  return updatedMsg;
}
