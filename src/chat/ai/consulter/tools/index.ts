import type { StructuredTool } from "@langchain/core/tools";

import {
  MessagesEventOptions,
  MessagesRoleOptions,
} from "@/shared/models/pocketbase-types";

import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { historyRepository } from "@/messages/history/repository";
import type { ToolMessage } from "@langchain/core/messages";
import type { Usager } from "@/billing/usager";

import type { ConsulterMemory } from "../memories";
import type { WorkflowConfig } from "../workflows";

import { callSearchChain } from "./call-search-agent";
import { updateLead } from "./update-lead";
import { createTicket } from "./create-ticket";
import { callOperator } from "./call-operator";

export const chatTools: StructuredTool[] = [
  updateLead,
  createTicket,
  callOperator,
  callSearchChain,
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
  let visible = false;
  const metadata = {
    toolCallId: toolCall.id,
    loading: true,
    needApproval: false,
  };
  switch (toolCall.name) {
    case "callSearchAgent":
      visible = true;
      break;
    case "callOperator":
      visible = true;
      break;
    case "createTicket":
      visible = false;
      break;
    case "updateLead":
      visible = false;
      break;
    default:
      break;
  }
  // PROMISE UPDATE
  const pbMessages = await historyRepository.updateHistory([
    {
      content: "<PROMISE>",
      role: MessagesRoleOptions.tool,
      metadata,
      room: memory.room.id,
      sentBy: memory.agent.name,
      visible,
      event: toolCall.name as MessagesEventOptions,
    },
  ]);

  // CALL TOOL
  const toolMessage: ToolMessage = await chatToolsMap[toolCall.name].invoke(
    toolCall,
    {
      configurable: {
        memory,
        usager,
        workflowConfig,
      },
    }
  );

  const updatedMessages = historyLangchainAdapter.buildPBHistory([
    {
      msg: toolMessage,
      opts: {
        roomId: memory.room.id,
        agent: memory.agent,
        visible,
      },
    },
  ]);

  const msg = updatedMessages[0];
  msg.metadata = {
    ...(msg.metadata || {}),
    loading: false,
    needApproval: false,
  };
  await historyRepository.replaceMessage(pbMessages[0].id, msg);
};
