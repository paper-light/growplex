import type { StructuredTool } from "@langchain/core/tools";

import { MessagesRoleOptions } from "@/shared/models/pocketbase-types";

import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import type { ToolMessage } from "@langchain/core/messages";
import type { Usager } from "@/billing/usager";
import type { Model, ModelUsage } from "@/billing/types";
import { sender } from "@/messages/sender/sender";
import { logger } from "@/shared/lib/logger";

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
  // PRE VISIBILITY
  const metadata = {
    toolCallId: toolCall.id,
    loading: true,
    needApproval: false,
    toolName: toolCall.name,
    visible: ["callSearchAgent", "callOperator"].includes(toolCall.name),
  };
  // PROMISE UPDATE
  const pbMessages = await pbHistoryRepository.updateHistory([
    {
      content: "<PROMISE>",
      role: MessagesRoleOptions.tool,
      metadata,
      room: memory.room.id,
      sentBy: memory.agent.name,
      visible: metadata.visible,
      event: toolCall.name,
    },
  ]);

  if (metadata.visible)
    sender.sendMessage(memory.room.id, pbMessages[0], "new-message");

  log.debug({ usager }, "usager before tool call");
  // CALL TOOL
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
  workflowConfig.messages.push(toolMessage);

  log.debug({ usager }, "usager after tool call");

  // UPDATE PROMISE MESSAGE
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
  if (metadata.visible)
    sender.sendMessage(memory.room.id, updatedMsg, "update-message");
};
