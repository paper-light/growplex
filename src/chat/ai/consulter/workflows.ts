import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

import { AIMessageChunk } from "@langchain/core/messages";
import { callTool, chatTools } from "./tools";

import { logger } from "@/shared/lib/logger";
import { Usager } from "@/billing/usager";

import { loadConsulterMemory } from "./memories";
import { baseConsulterModel, CHAT_CONSULTER_MODEL } from "./models";
import { consulterPromptTemplate } from "./prompts";
import { sender } from "@/messages/sender/sender";

const log = logger.child({
  module: "chat:ai:workflow",
});

export type WorkflowConfig = {
  roomId: string;
  query: string;
  withTools: boolean;
  withSearch: boolean;
  knowledge: string;
  messages: any[];
};

export const runChatWorkflow = async (roomId: string, query: string) => {
  const usager = new Usager();
  const memory = await loadConsulterMemory(roomId);

  log.info({ roomId, query }, "runChatWorkflow started");
  const workflowConfig: WorkflowConfig = {
    query,
    roomId,
    knowledge: "",
    withTools: true,
    withSearch: true,
    messages: [],
  };

  let result: AIMessageChunk | null = null;
  let callingTools;

  for (let i = 0; i < 3; i++) {
    if (i === 2) workflowConfig.withTools = false;
    let tools = workflowConfig.withTools ? chatTools : [];
    if (!workflowConfig.withSearch) {
      tools = tools.filter((t) => t.name !== "callSearchChain");
    }

    // CHAT CHAIN
    log.info({ iteration: i, roomId }, "Invoking chatChain");

    log.debug({ workflowConfig }, "before consulter call");
    result = await consulterPromptTemplate
      .pipe(baseConsulterModel.bindTools(tools))
      .invoke({
        history: [...memory.history, ...workflowConfig.messages],
        knowledge: workflowConfig.knowledge,
        system: memory.agent.system,
        query,
        lead: JSON.stringify(memory.lead, null, 2),
      });
    workflowConfig.messages.push(result!);

    callingTools = !!result!.tool_calls?.length;
    usager.update(result!, CHAT_CONSULTER_MODEL);

    log.debug({ result, usager }, "chatChain result");
    const newMessages = historyLangchainAdapter.buildPBHistory([
      {
        msg: result!,
        opts: {
          roomId,
          agent: memory.agent,
          visible: !callingTools,
        },
      },
    ]);
    const assistantMessages = await pbHistoryRepository.updateHistory(
      newMessages
    );
    if (!callingTools) {
      sender.sendMessage(roomId, assistantMessages[0]);
      break;
    }

    log.debug({ toolCalls: result!.tool_calls }, "Calling tools");

    await Promise.all(
      result!.tool_calls!.map(async (toolCall) => {
        await callTool(toolCall, memory, workflowConfig, usager);
      })
    );
  }

  // END LOOP
  log.info({ roomId }, "runChatWorkflow completed");
  return {
    price: usager.calculatePrice(),
  };
};
