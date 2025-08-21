import { pb } from "@/shared/lib/pb";
import {
  historyLangchainAdapter,
  type LangchainMessage,
} from "@/messages/history/langchain-adapter";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import {
  type ChatsResponse,
  type LeadsResponse,
  type MessagesResponse,
  type RoomsResponse,
} from "@/shared/models/pocketbase-types";

export type RoomMemory = {
  room: RoomsResponse;
  lead: LeadsResponse | null;
  chat: ChatsResponse | null;
  history: LangchainMessage[];
  message: MessagesResponse;
};

export async function loadRoomMemory(roomId: string): Promise<RoomMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand: "lead,chat",
  });

  const lead: LeadsResponse | null = (room.expand as any)?.lead || null;
  const chat: ChatsResponse | null = (room.expand as any)?.chat || null;

  room.expand = null;
  lead && (lead.expand = null);
  chat && (chat.expand = null);

  const pbHistory: MessagesResponse[] = await pbHistoryRepository.getHistory(
    roomId,
    false
  );
  const message: MessagesResponse = pbHistory[pbHistory.length - 1];
  const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

  return {
    room,
    lead,
    chat,
    history,
    message,
  };
}
