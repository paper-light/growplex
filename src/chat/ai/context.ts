import { Runnable, RunnableLambda } from "@langchain/core/runnables";

import { pb } from "@/shared/lib/pb";
import type {
  LeadsResponse,
  RoomsResponse,
  ChatsResponse,
  IntegrationsResponse,
  AgentsResponse,
  SourcesResponse,
  OrgsResponse,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { setContextVariable } from "@langchain/core/context";
import { logger } from "@/shared/lib/logger";
import { historyRepository } from "@/messages/history/repository";
import {
  historyLangchainAdapter,
  type LangchainMessage,
} from "@/messages/history/langchain-adapter";
import { langfuseHandler } from "@/shared/lib/langfuse";

const log = logger.child({ module: "chat:ai:context" });

export async function loadDataForContext(roomId: string) {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "lead,chat,chat.integration,chat.integration.agents,chat.integration.sources,chat.project,chat.project.org",
  });

  const lead = (room.expand as any)?.lead;
  const chat = (room.expand as any)?.chat;
  const integration = (chat.expand as any)?.integration;
  const agent = (integration.expand as any)?.agents?.[0];
  const sources = (integration.expand as any)?.sources;
  const org = (chat.expand as any)?.project.expand.org;

  const pbHistory = await historyRepository.getHistory(roomId, false);
  const message = pbHistory[pbHistory.length - 1];
  const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

  log.debug({ history }, "history");

  return {
    room,
    lead,
    chat,
    integration,
    agent,
    sources,
    org,
    history,
    message,
  };
}

export const contextLambda = (cb?: Runnable, opts?: any) => {
  return RunnableLambda.from(
    async (input: {
      data: {
        room: RoomsResponse;
        lead: LeadsResponse;
        chat: ChatsResponse;
        integration: IntegrationsResponse;
        agent: AgentsResponse;
        sources: SourcesResponse;
        org: OrgsResponse;

        history: LangchainMessage[];
        message: MessagesResponse;
      };

      query: string;
      knowledge: string;
      withTools: boolean;
      withSearch: boolean;
    }) => {
      // Chain config
      setContextVariable("query", input.query);

      setContextVariable("withTools", input.withTools);
      setContextVariable("withSearch", input.withSearch);

      setContextVariable("knowledge", input.knowledge);

      // Context data
      setContextVariable("room", input.data.room);
      setContextVariable("lead", input.data.lead);
      setContextVariable("chat", input.data.chat);
      setContextVariable("integration", input.data.integration);
      setContextVariable("agent", input.data.agent);
      setContextVariable("sources", input.data.sources);
      setContextVariable("org", input.data.org);

      // History
      setContextVariable("history", input.data.history);
      setContextVariable("message", input.data.message);

      return await cb?.invoke(opts || {});
    }
  );
};
