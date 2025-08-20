import { Usager } from "@/billing/usager";
import { loadRoomMemory } from "@/shared/ai/memories/load-room-memory";
import { langfuseHandler } from "@/shared/lib/langfuse";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { sender } from "@/messages/sender/sender";
import { callTool } from "@/shared/ai/tools/call-tool";

import { oraclePromptTemplate } from "./prompts";
import { oracleTools, oracleToolsMap } from "./tools";
import { baseOracleModel, ORACLE_MODEL } from "./llms";

export type RunOracleConfig = {
  roomId: string;
  query: string;
  withTools: boolean;
  messages: any[];
};

export async function runOracle(roomId: string, query: string) {
  const usager = new Usager();
  const memory = await loadRoomMemory(roomId);
  const runConfig: RunOracleConfig = {
    query,
    roomId,
    withTools: true,
    messages: [],
  };

  const MAX_ITERATIONS = 5;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (i === MAX_ITERATIONS - 1) runConfig.withTools = false;
    const tools = runConfig.withTools ? oracleTools : [];

    const result = await oraclePromptTemplate
      .pipe(baseOracleModel.bindTools(tools))
      .invoke(
        {
          query: runConfig.query,
          integration: memory.integration,
          agents: memory.agents,
          chat: memory.chat,
        },
        {
          callbacks: [langfuseHandler],
        }
      );
    runConfig.messages.push(result!);
    const callingTools = !!result.tool_calls?.length;
    usager.update(result, ORACLE_MODEL);

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

    for (const toolCall of result.tool_calls!) {
      await callTool(
        oracleToolsMap[toolCall.name],
        toolCall,
        memory,
        runConfig,
        usager
      );
    }
  }

  return { price: usager.calculatePrice() };
}
