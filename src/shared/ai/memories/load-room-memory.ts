import { pb } from "@/shared/lib/pb";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import {
  type ChatsResponse,
  type LeadsResponse,
  type AgentsResponse,
  type IntegrationsResponse,
  type SourcesResponse,
  type OrgsResponse,
  type MessagesResponse,
  type RoomsResponse,
} from "@/shared/models/pocketbase-types";

const EXPAND = [
  "lead",
  "chat",
  // INTEGRATION
  "chat.integration",
  "chat.integration.agents",
  "chat.integration.sources",

  // PROJECT
  "chat.project",
  "chat.project.org",
].join(",");

export type RoomMemory = {
  room: RoomsResponse;
  lead: LeadsResponse;
  chat: ChatsResponse;
  integration: IntegrationsResponse;
  org: OrgsResponse;
  agents: AgentsResponse[];
  sources: SourcesResponse[];

  // HISTORY
  history: any[]; // LangchainMessage[];
  message: MessagesResponse;
};

export async function loadRoomMemory(roomId: string): Promise<RoomMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand: EXPAND,
  });

  // ROOM POCKETBASE DATA
  const lead: LeadsResponse = (room.expand as any)?.lead || null;
  const chat: ChatsResponse = (room.expand as any)?.chat || null;

  // INTEGRATION
  const integration: IntegrationsResponse =
    (chat.expand as any)?.integration || null;
  const agents: AgentsResponse[] = (integration.expand as any)?.agents || [];
  const org: OrgsResponse = (chat.expand as any)?.project.expand.org || null;
  const sources: SourcesResponse[] = (integration.expand as any)?.sources || [];

  // HISTORY
  const pbHistory: MessagesResponse[] = await pbHistoryRepository.getHistory(
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
    agents,
    sources,
    org,

    // HISTORY
    history,
    message,
  };
}
