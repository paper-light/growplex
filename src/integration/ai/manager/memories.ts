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
import { pbHistoryRepository } from "@/messages/history/pb-repository";
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

const EXPAND = [
  "lead",
  "chat",
  // INTEGRATION
  "chat.integration",
  "chat.integration.agents",
  "chat.integration.sources",
  "chat.integration.chats",
  // PROJECT
  "chat.project",
  "chat.project.org",
  "chat.project.agents",
].join(",");

export async function loadIntegrationManagerMemory(
  roomId: string
): Promise<IntegrationManagerMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand: EXPAND,
  });

  // ROOM POCKETBASE DATA
  const lead: LeadsResponse = (room.expand as any)?.lead || null;
  const chat: ChatsResponse = (room.expand as any)?.chat || null;

  // INTEGRATION POCKETBASE DATA
  const integration: IntegrationsResponse =
    (chat.expand as any)?.integration || null;
  const agent: AgentsResponse =
    (integration.expand as any)?.agents?.[0] || null;
  const chats: ChatsResponse[] = (integration.expand as any)?.chats || [];
  const org: OrgsResponse = (chat.expand as any)?.project.expand.org || null;
  const sources: SourcesResponse[] = (integration.expand as any)?.sources || [];

  // HISTORY
  const pbHistory: MessagesResponse[] = await pbHistoryRepository.getHistory(
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
