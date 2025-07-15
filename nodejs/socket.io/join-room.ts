import { type Socket } from "socket.io";

import { pb } from "@/shared/lib/pb";
import { getHistory } from "@/chat/history/get";
import type { RoomsResponse, RoomExpand } from "@/shared/models";

export async function joinRoom(
  socket: Socket,
  room: RoomsResponse<RoomExpand>
) {
  // Join room
  socket.join(room.id);

  // Add room to authorized rooms
  if (!socket.data.authorizedRooms) socket.data.authorizedRooms = new Set();
  socket.data.authorizedRooms.add(room.id);

  // Get integration
  const integration = await pb
    .collection("integrations")
    .getFirstListItem(`chat="${room.chat}"`);

  try {
    const history = await getHistory(integration.id, room.id);
    socket.emit("chat-history", history);
  } catch (err) {
    console.error("Error in getHistory:", err);
    socket.emit("chat-history", []);
  }
}
