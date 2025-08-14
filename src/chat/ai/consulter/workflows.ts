import { historyRepository } from "@/messages/history/repository";
import type {
  AgentsResponse,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

import { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import { chatToolsMap } from "./tools";

import { logger } from "@/shared/lib/logger";
import { langfuseHandler } from "@/shared/lib/langfuse";
import { Usager } from "@/billing/usager";

import { SEARCH_SUMMARY_MODEL } from "@/search/ai/summary";

import { consulterMemory } from "./memory";
import { CHAT_CONSULTER_MODEL } from "./models";
import { consulterChain, type DynamicConsulterChainInput } from "./chain";

const log = logger.child({
  module: "chat:ai:workflow",
});

export const runChatWorkflow = async (roomId: string, query: string) => {
  const allMessages: MessagesResponse[] = [];
  const usager = new Usager();

  log.info({ roomId, query }, "runChatWorkflow started");

  let data = await consulterMemory.loadRoomContext(roomId);
  log.debug({ roomId }, "Loaded context data");
  const chatInput: DynamicConsulterChainInput = {
    query,
    roomId,
    knowledge: "",
    withTools: true,
    withSearch: true,
  };

  let result: AIMessageChunk | null = null;
  let callingTools = true;

  for (let i = 0; i < 2; i++) {
    // CHAT CHAIN
    log.info({ iteration: i, roomId }, "Invoking chatChain");
    result = await consulterChain.invoke(chatInput, {
      callbacks: [langfuseHandler],
    });

    callingTools = !!result?.tool_calls?.length;
    usager.update(result!, CHAT_CONSULTER_MODEL);

    log.debug({ result, usager }, "chatChain result");
    const newMessages = historyLangchainAdapter.buildPBHistory([
      {
        msg: result!,
        opts: {
          roomId,
          agent: data.agent,
          visible: !callingTools,
        },
      },
    ]);
    allMessages.push(...(await historyRepository.updateHistory(newMessages)));

    if (!callingTools) break;

    // TOOL CALLS
    log.debug({ toolCalls: result!.tool_calls }, "Calling tools");
    const toolMessages = await runTools(
      result!,
      roomId,
      data.agent,
      chatInput,
      usager
    );
    allMessages.push(...(await historyRepository.updateHistory(toolMessages)));
  }

  if (callingTools) {
    chatInput.withTools = false;
    log.info({ roomId }, "Final assistant message after tools");
    result = await consulterChain.invoke(chatInput, {
      callbacks: [langfuseHandler],
    });

    usager.update(result!, CHAT_CONSULTER_MODEL);

    const newMessages = historyLangchainAdapter.buildPBHistory([
      {
        msg: result!,
        opts: {
          roomId,
          agent: data.agent,
          visible: true,
        },
      },
    ]);
    allMessages.push(...(await historyRepository.updateHistory(newMessages)));
  }

  log.info({ count: allMessages.length }, "runChatWorkflow completed");
  return {
    messages: allMessages.filter((m) => m.visible),
    usagePrice: usager.calculatePrice(),
  };
};

async function runTools(
  result: AIMessageChunk,
  roomId: string,
  agent: AgentsResponse,
  chatInput: DynamicConsulterChainInput,
  usager: Usager
) {
  log.debug({ toolCalls: result!.tool_calls }, "Calling tools");
  const toolPromises = result!.tool_calls!.map(async (toolCall) => {
    log.debug({ toolCall }, "Tool call");

    const toolMessage = await chatToolsMap[toolCall.name].invoke(toolCall, {
      configurable: {
        roomId,
      },
      callbacks: [langfuseHandler],
    });
    log.debug({ toolMessage, name: toolCall.name }, "Tool message");

    if (toolMessage.name === "callSearchChain") {
      const data = JSON.parse(toolMessage.content);
      usager.updateMetadataUsage(data.usage, SEARCH_SUMMARY_MODEL);

      const answer = data.result;
      const content = answer.content;
      const success = answer.success;
      toolMessage.content = success
        ? JSON.stringify({
            content: "✅ Found relevant information for your question",
            success: true,
          })
        : JSON.stringify({
            content: "❌ No relevant information found",
            success: false,
          });

      chatInput.knowledge = JSON.stringify(
        `Relevant to query: ${success ? "✅" : "❌"}
        Search results: ${content}`
      );
      chatInput.withSearch = false;
    }

    return toolMessage as ToolMessage;
  });
  const toolMessages = await Promise.all(toolPromises);
  log.debug({ toolMessages }, "Tool messages results");

  const newMessages = historyLangchainAdapter.buildPBHistory(
    toolMessages.map((toolMessage) => {
      return {
        msg: toolMessage,
        opts: {
          roomId,
          agent: agent,
          visible:
            // @ts-ignore
            chatToolsMap[toolMessage.name]?.metadata?.visible ?? false,
        },
      };
    })
  );
  return newMessages;
}
