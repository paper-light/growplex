import { historyRepository } from "@/messages/history/repository";
import type {
  AgentsResponse,
  MessagesRecord,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

import { consulterChain } from "./consulter";
import { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import { chatToolsMap } from "./tools";

import { context } from "./context";
import { logger } from "@/shared/lib/logger";
import { langfuseHandler } from "@/shared/lib/langfuse";
import {
  RunnableParallel,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const log = logger.child({
  module: "chat:ai:workflow",
});

interface ChatInput {
  query: string;
  roomId: string;
  knowledge: string;
  withTools: boolean;
  withSearch: boolean;
}

interface Usage {
  cache: number;
  in: number;
  out: number;
}

const chatChain = RunnableSequence.from([
  RunnableParallel.from({
    chainInput: new RunnablePassthrough(),
    history: historyRepository.asLambda(),
    context: context.asLambda(),
  }),
  consulterChain,
]);

async function runTools(
  result: AIMessageChunk,
  roomId: string,
  agent: AgentsResponse,
  chatInput: ChatInput
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
      const content = data.content;
      const success = data.success;
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

async function updateUsage(result: AIMessageChunk, usage: Usage) {
  const cache = result!.usage_metadata?.input_token_details?.cache_read ?? 0;
  const totalInput = result!.usage_metadata?.input_tokens ?? 0;
  const totalOutput = result!.usage_metadata?.output_tokens ?? 0;
  usage.cache += cache;
  usage.in += totalInput - cache;
  usage.out += totalOutput;
}
export const runChatWorkflow = async (roomId: string, query: string) => {
  const allMessages: MessagesResponse[] = [];
  const usage: Usage = {
    cache: 0,
    in: 0,
    out: 0,
  };

  log.info({ roomId, query }, "runChatWorkflow started");

  let data = await context.loadRoomContext(roomId);
  log.debug({ roomId }, "Loaded context data");
  const chatInput: ChatInput = {
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
    result = await chatChain.invoke(chatInput, {
      callbacks: [langfuseHandler],
    });

    callingTools = !!result?.tool_calls?.length;
    updateUsage(result!, usage);

    log.debug({ result, usage }, "chatChain result");
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
    const toolMessages = await runTools(result!, roomId, data.agent, chatInput);
    allMessages.push(...(await historyRepository.updateHistory(toolMessages)));
  }

  if (callingTools) {
    chatInput.withTools = false;
    log.info({ roomId }, "Final assistant message after tools");
    result = await chatChain.invoke(chatInput, {
      callbacks: [langfuseHandler],
    });

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
    usage,
  };
};
