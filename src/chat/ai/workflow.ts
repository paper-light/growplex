import { RunnableSequence } from "@langchain/core/runnables";

import { historyRepository } from "@/messages/history/repository";
import type {
  MessagesRecord,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

import { consulterChain } from "./consulter";
import { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import { chatToolsMap } from "./tools";

import { contextLambda, loadDataForContext } from "./context";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "chat:ai:workflow",
});

const chatChain = RunnableSequence.from([
  historyRepository.getAsLambda(),
  consulterChain,
]);
export const chatChainWithContext = contextLambda(chatChain);

export const runChatWorkflow = async (roomId: string, query: string) => {
  const returnMessages: MessagesResponse[] = [];

  log.info({ roomId, query }, "runChatWorkflow started");

  const data = await loadDataForContext(roomId);
  log.debug({ roomId }, "Loaded context data");
  const invokeOptions = {
    ...data,
    query,
    knowledge: "",
    withTools: true,
  };

  let messagesToPersist: Partial<MessagesRecord>[] = [];
  let result: AIMessageChunk | null = null;
  let callingTools = true;

  for (let i = 0; i < 3; i++) {
    if (messagesToPersist.length > 0) {
      returnMessages.push(
        ...(await historyRepository.updateHistory(messagesToPersist))
      );
      messagesToPersist = [];
    }

    log.info({ iteration: i, roomId }, "Invoking chatChainWithContext");
    result = await chatChainWithContext.invoke(invokeOptions);
    log.debug({ result }, "chatChainWithContext result");

    callingTools = !!result?.tool_calls?.length;

    messagesToPersist.push(
      ...historyLangchainAdapter.buildPBHistory([
        {
          msg: result!,
          opts: {
            roomId,
            agent: data.agent,
            visible: !callingTools,
          },
        },
      ])
    );
    log.debug({ messagesToPersist }, "Persisting messages");

    if (!callingTools) break;

    log.debug({ toolCalls: result!.tool_calls }, "Calling tools");

    const toolPromises = result!.tool_calls!.map(async (toolCall) => {
      const toolMessage = await contextLambda(
        chatToolsMap[toolCall.name],
        toolCall
      ).invoke(invokeOptions);
      log.debug({ toolMessage, name: toolCall.name }, "Tool message");
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
              agent: data.agent,
              visible:
                // @ts-ignore
                chatToolsMap[toolMessage.name]?.metadata?.visible ?? false,
            },
          };
        })
      )
    );
  }

  if (messagesToPersist.length > 0) {
    returnMessages.push(
      ...(await historyRepository.updateHistory(messagesToPersist))
    );
    messagesToPersist = [];
  }

  if (callingTools) {
    invokeOptions.withTools = false;
    log.info({ roomId }, "Final assistant message after tools");
    result = await chatChainWithContext.invoke(invokeOptions);

    messagesToPersist.push(
      ...historyLangchainAdapter.buildPBHistory([
        {
          msg: result!,
          opts: {
            roomId,
            agent: data.agent,
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
