import { historyRepository } from "@/messages/history/repository";
import type {
  MessagesRecord,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

import { consulterChain } from "./consulter";
import { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import { chatToolsMap } from "./tools";

import { contextLambda, loadDataForContext } from "./context";
import { logger } from "@/shared/lib/logger";
import { langfuseHandler } from "@/shared/lib/langfuse";

const log = logger.child({
  module: "chat:ai:workflow",
});

const chatChain = consulterChain;

export const chatChainWithContext = contextLambda(chatChain);

export const runChatWorkflow = async (roomId: string, query: string) => {
  const returnMessages: MessagesResponse[] = [];

  log.info({ roomId, query }, "runChatWorkflow started");

  let contextData = await loadDataForContext(roomId);
  log.debug({ roomId }, "Loaded context data");
  const contextInput = {
    data: contextData,
    query,
    knowledge: "",
    withTools: true,
    withSearch: true,
  };

  let messagesToPersist: Partial<MessagesRecord>[] = [];
  let result: AIMessageChunk | null = null;
  let callingTools = true;

  for (let i = 0; i < 2; i++) {
    if (messagesToPersist.length > 0) {
      returnMessages.push(
        ...(await historyRepository.updateHistory(messagesToPersist))
      );
      messagesToPersist = [];
      contextData = await loadDataForContext(roomId);
      contextInput.data = contextData;
    }

    log.info({ iteration: i, roomId }, "Invoking chatChainWithContext");
    result = await chatChainWithContext.invoke(contextInput, {
      callbacks: [langfuseHandler],
    });
    log.debug({ result }, "chatChainWithContext result");

    callingTools = !!result?.tool_calls?.length;

    messagesToPersist.push(
      ...historyLangchainAdapter.buildPBHistory([
        {
          msg: result!,
          opts: {
            roomId,
            agent: contextData.agent,
            visible: !callingTools,
          },
        },
      ])
    );
    log.debug({ messagesToPersist }, "Persisting messages");

    if (!callingTools) break;

    log.debug({ toolCalls: result!.tool_calls }, "Calling tools");

    const toolPromises = result!.tool_calls!.map(async (toolCall) => {
      log.debug({ toolCall }, "Tool call");

      const toolMessage = await contextLambda(
        chatToolsMap[toolCall.name],
        toolCall
      ).invoke(contextInput, {
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

        contextInput.knowledge = JSON.stringify(
          `Relevant to query: ${success ? "✅" : "❌"}
          Search results: ${content}`
        );

        contextInput.withSearch = false;
      }

      return toolMessage as ToolMessage;
    });
    const toolMessages = await Promise.all(toolPromises);
    log.debug({ toolMessages }, "Tool messages results");

    messagesToPersist.push(
      ...historyLangchainAdapter.buildPBHistory(
        toolMessages.map((toolMessage) => {
          return {
            msg: toolMessage,
            opts: {
              roomId,
              agent: contextData.agent,
              visible:
                // @ts-ignore
                chatToolsMap[toolMessage.name]?.metadata?.visible ?? false,
            },
          };
        })
      )
    );

    contextData = await loadDataForContext(roomId);
    contextInput.data = contextData;
  }

  if (messagesToPersist.length > 0) {
    returnMessages.push(
      ...(await historyRepository.updateHistory(messagesToPersist))
    );
    messagesToPersist = [];
    contextData = await loadDataForContext(roomId);
    contextInput.data = contextData;
  }

  if (callingTools) {
    contextInput.withTools = false;
    log.info({ roomId }, "Final assistant message after tools");
    result = await chatChainWithContext.invoke(contextInput, {
      callbacks: [langfuseHandler],
    });

    messagesToPersist.push(
      ...historyLangchainAdapter.buildPBHistory([
        {
          msg: result!,
          opts: {
            roomId,
            agent: contextData.agent,
            visible: true,
          },
        },
      ])
    );
    returnMessages.push(
      ...(await historyRepository.updateHistory(messagesToPersist))
    );
  }

  log.info({ count: returnMessages.length }, "runChatWorkflow completed");
  return returnMessages.filter((m) => m.visible);
};
