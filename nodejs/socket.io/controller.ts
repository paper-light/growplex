import { Server as IOServer, Socket } from "socket.io";

import { pb } from "@/shared/lib/pb";
import { rateLimitThrow } from "@/shared/helpers/rate-limite";

import { guardRoomAccess } from "@/auth/guards/guard-room-access";
import { embedder } from "@/search/embedder";

import { joinRoom } from "./join-room";
import { sendMessage } from "./send-message";
import { chatRateLimiter } from "./rate-limiter";
import { useMiddlewares } from "./middleware";
import type { JoinRoomDTO, SendMessageDTO } from "./types";
import { CHAT_CONFIG } from "@/chat/config";

export function attachSocketIO(httpServer: any) {
  const io = new IOServer(httpServer);

  useMiddlewares(io);

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on("join-room", async (dto: JoinRoomDTO) => {
      const room = await pb.collection("rooms").getOne(dto.roomId, {
        expand: "chat",
      });

      await guardRoomAccess(socket, room);

      await joinRoom(socket, room);
    });

    socket.on("send-message", async (dto: SendMessageDTO) => {
      const room = await pb.collection("rooms").getOne(dto.roomId, {
        expand: "chat",
      });

      await guardRoomAccess(socket, room);

      const msg = JSON.parse(dto.msgStr);

      if (
        embedder.countTokens(msg.content, "gpt-4") > CHAT_CONFIG.MAX_MSG_TOKENS
      ) {
        socket.emit("msg-length-limit", {
          message: "Message is too long!",
        });
        return;
      }

      const userId = socket.data.user?.id || socket.data.guest?.username;
      const limiterKey = `room:${dto.roomId}:user:${userId}`;

      await rateLimitThrow(chatRateLimiter, limiterKey, 1);

      sendMessage(socket, io, dto);
    });

    socket.on("leave-room", (dto) => {
      socket.leave(dto.roomId);
    });

    socket.on("disconnect", async () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
