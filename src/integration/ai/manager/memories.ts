import type {
  MessagesResponse,
  OrgsResponse,
  SourcesResponse,
  AgentsResponse,
  IntegrationsResponse,
  ChatsResponse,
  RoomsResponse,
  LeadsResponse,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";
import { historyRepository } from "@/messages/history/repository";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";

export type IntegrationManagerMemory = {
  room: RoomsResponse;
  lead: LeadsResponse;
  chat: ChatsResponse;
  chats: ChatsResponse[];
  integration: IntegrationsResponse;
  agent: AgentsResponse;
  org: OrgsResponse;
  sources: SourcesResponse[];
  history: any[]; // LangchainMessage[];
};

export async function loadIntegrationManagerMemory(
  roomId: string
): Promise<IntegrationManagerMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "lead,chat,chat.integration,chat.integration.agents,chat.integration.sources,chat.integration.chats,chat.project,chat.project.org",
  });

  // ROOM POCKETBASE DATA
  const lead: LeadsResponse = (room.expand as any)?.lead || null;
  const chat: ChatsResponse = (room.expand as any)?.chat || null;
  const integration: IntegrationsResponse =
    (chat.expand as any)?.integration || null;
  const agent: AgentsResponse =
    (integration.expand as any)?.agents?.[0] || null;
  const chats: ChatsResponse[] = (integration.expand as any)?.chats || [];
  const org: OrgsResponse = (chat.expand as any)?.project.expand.org || null;
  const sources: SourcesResponse[] = (integration.expand as any)?.sources || [];

  // HISTORY
  const pbHistory: MessagesResponse[] = await historyRepository.getHistory(
    roomId,
    false
  );
  const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

  return {
    // ROOM POCKETBASE DATA
    room,
    lead,
    chat,
    chats,
    integration,
    agent,
    sources,
    org,

    // HISTORY
    history,
  };
}
