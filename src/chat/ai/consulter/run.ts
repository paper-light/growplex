import { AIMessageChunk } from "@langchain/core/messages";

import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { logger } from "@/shared/lib/logger";
import { Usager } from "@/billing/usager";
import { sender } from "@/messages/sender/sender";
import { langfuseHandler } from "@/shared/lib/langfuse";
import { loadRoomMemory } from "@/shared/ai/memories/load-room-memory";
import { callTool } from "@/shared/ai/tools/call-tool";

import { baseConsulterModel, CHAT_CONSULTER_MODEL } from "./llms";
import { consulterPromptTemplate } from "./prompts";
import { consulterTools, consulterToolsMap } from "./tools";

const log = logger.child({
  module: "chat:ai:workflow",
});

export type RunConsulterConfig = {
  roomId: string;
  query: string;
  withTools: boolean;
  withSearch: boolean;
  knowledge: string;
  messages: any[];
};

export const runConsulter = async (roomId: string, query: string) => {
  const usager = new Usager();
  const memory = await loadRoomMemory(roomId);

  log.info({ roomId, query }, "runChatWorkflow started");
  const runConfig: RunConsulterConfig = {
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
    if (i === 2) runConfig.withTools = false;
    let tools = runConfig.withTools ? consulterTools : [];
    if (!runConfig.withSearch) {
      tools = tools.filter((t) => t.name !== "callSearchChain");
    }

    // CHAT CHAIN
    log.info({ iteration: i, roomId }, "Invoking chatChain");

    log.debug({ runConfig }, "before consulter call");
    result = await consulterPromptTemplate
      .pipe(baseConsulterModel.bindTools(tools))
      .invoke(
        {
          history: [...memory.history, ...runConfig.messages],
          knowledge: runConfig.knowledge,
          system: memory.agents[0].system,
          query,
          lead: JSON.stringify(memory.lead, null, 2),
        },
        {
          callbacks: [langfuseHandler],
        }
      );
    runConfig.messages.push(result!);

    callingTools = !!result!.tool_calls?.length;
    usager.update(result!, CHAT_CONSULTER_MODEL);

    log.debug({ result, usager }, "chatChain result");
    const newMessages = historyLangchainAdapter.buildPBHistory([
      {
        msg: result!,
        opts: {
          roomId,
          agent: memory.agents[0],
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

    for (const toolCall of result!.tool_calls!) {
      await callTool(
        consulterToolsMap[toolCall.name],
        toolCall,
        memory,
        runConfig,
        usager
      );
    }
  }

  // END LOOP
  log.info({ roomId }, "runChatWorkflow completed");
  return {
    price: usager.calculatePrice(),
  };
};
