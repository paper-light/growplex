import { io } from "socket.io-client";
import type { MessagesResponse } from "@/shared/models/pocketbase-types";

export function getSocket(
  token: string,
  roomId: string,
  onHistory: (history: MessagesResponse[]) => void,
  onNewMessage: (m: MessagesResponse) => void
) {
  const socket = io({
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("🟢 Connected to server, socket.id =", socket?.id, roomId);
    socket?.emit("join-room", {
      roomId,
    });
  });

  socket.on("chat-history", (history: MessagesResponse[]) => {
    onHistory(history);
  });

  socket.on("new-message", (m: MessagesResponse) => {
    onNewMessage(m);
  });

  socket.on("rate-limit", (data: { message: string }) => {
    console.warn("Rate limit from server:", data.message);
  });

  return socket;
}
