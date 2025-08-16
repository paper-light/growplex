import { logger } from "@/shared/lib/logger";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { historyRepository } from "@/messages/history/repository";
import { pb } from "@/shared/lib/pb";
import type {
  ChatsResponse,
  LeadsResponse,
  AgentsResponse,
  IntegrationsResponse,
  SourcesResponse,
  OrgsResponse,
  MessagesResponse,
  RoomsResponse,
} from "@/shared/models/pocketbase-types";

const log = logger.child({ module: "chat:ai:context" });

export type ConsulterMemory = {
  room: RoomsResponse;
  lead: LeadsResponse;
  chat: ChatsResponse;
  integration: IntegrationsResponse;
  agent: AgentsResponse;
  org: OrgsResponse;
  sources: SourcesResponse[];
  history: any[]; // LangchainMessage[];
  message: MessagesResponse;
};

export async function loadConsulterMemory(
  roomId: string
): Promise<ConsulterMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "lead,chat,chat.integration,chat.integration.agents,chat.integration.sources,chat.project,chat.project.org",
  });

  // ROOM POCKETBASE DATA
  const lead: LeadsResponse = (room.expand as any)?.lead || null;
  const chat: ChatsResponse = (room.expand as any)?.chat || null;
  const integration: IntegrationsResponse =
    (chat.expand as any)?.integration || null;
  const agent: AgentsResponse =
    (integration.expand as any)?.agents?.[0] || null;
  const org: OrgsResponse = (chat.expand as any)?.project.expand.org || null;
  const sources: SourcesResponse[] = (integration.expand as any)?.sources || [];

  // HISTORY
  const pbHistory: MessagesResponse[] = await historyRepository.getHistory(
    roomId,
    false
  );
  const message: MessagesResponse = pbHistory[pbHistory.length - 1];
  const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

  return {
    // ROOM POCKETBASE DATA
    room,
    lead,
    chat,
    integration,
    agent,
    sources,
    org,

    // HISTORY
    history,
    message,
  };
}
