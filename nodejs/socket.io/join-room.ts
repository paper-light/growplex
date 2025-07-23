import { type Socket } from "socket.io";

import { pb } from "@/shared/lib/pb";
import { getHistory } from "@/chat/history/get-history";
import type {
  RoomsResponse,
  IntegrationsResponse,
  ChatsResponse,
} from "@/shared/models/pocketbase-types";

export async function joinRoom(socket: Socket, room: RoomsResponse) {
  // Join room
  socket.join(room.id);

  // Get integration
  const chat = await pb.collection("chats").getOne(room.chat, {
    expand: "integration",
  });
  const integration: IntegrationsResponse = (chat.expand as any).integration!;

  try {
    const history = await getHistory(integration.id, room.id);
    socket.emit("chat-history", { roomId: room.id, history });
  } catch (err) {
    console.error("Error in getHistory:", err);
    socket.emit("chat-history", []);
  }
}
