import { Server as IOServer, Socket } from "socket.io";

import { pb } from "@/shared/lib/pb";
import type { RoomExpand } from "@/shared/models/expands";
import type { RoomsResponse } from "@/shared/models/pocketbase-types";
import { rateLimitThrow } from "@/shared/helpers/rate-limite";

import { globalEncoderService } from "@/llm";

import { joinRoom } from "./join-room";
import { sendMessage } from "./send-message";
import { chatRateLimiter } from "./rate-limiter";
import { useMiddlewares } from "./middleware";
import type { JoinRoomDTO, SendMessageDTO } from "./types";

export function attachSocketIO(httpServer: any) {
  const io = new IOServer(httpServer);

  useMiddlewares(io);

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on("join-room", async (dto: JoinRoomDTO) => {
      const room = await pb
        .collection("rooms")
        .getOne<RoomsResponse<RoomExpand>>(dto.roomId, {
          expand: "chat",
        });

      // Auth check
      if (socket.data.guest) {
        if (socket.data.guest.roomId !== dto.roomId) {
          socket.emit("unauthorized", {
            message: "Unauthorized",
          });
          return;
        }
      } else if (socket.data.user) {
        const user = socket.data.user;
        const chat = room.expand!.chat!;
        const project = await pb
          .collection("projects")
          .getFirstListItem(`chats:each ?= '${chat.id}'`);
        const projects = user.expand!.orgMembers!.flatMap(
          (m: any) => m.expand!.org!.projects
        );
        if (!project || !projects.includes(project.id)) {
          socket.emit("unauthorized", {
            message: "Unauthorized",
          });
          return;
        }
      } else {
        socket.emit("unauthorized", {
          message: "Unauthorized",
        });
        return;
      }

      await joinRoom(socket, room);
    });

    socket.on("send-message", async (dto: SendMessageDTO) => {
      // Auth check
      if (
        !socket.data.authorizedRooms ||
        !socket.data.authorizedRooms.has(dto.roomId)
      ) {
        socket.emit("unauthorized", { message: "Unauthorized" });
        return;
      }

      const msg = JSON.parse(dto.msgStr);

      if (
        globalEncoderService.countTokens(msg.content, "gpt-4") >
        parseInt(process.env.PUBLIC_CHAT_MAX_MESSAGE_TOKENS!)
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
