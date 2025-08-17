import { type Socket } from "socket.io";

import type { RoomsResponse } from "@/shared/models/pocketbase-types";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "socket.io:join-room",
});

export async function joinRoom(socket: Socket, room: RoomsResponse) {
  // Join room
  socket.join(room.id);

  try {
    const history = await pbHistoryRepository.getHistory(room.id, true);
    socket.emit("chat-history", { roomId: room.id, history });
  } catch (err) {
    log.error({ err }, "Error in getHistory");
    socket.emit("chat-history", []);
  }
}
