import { Server as IOServer, Socket } from "socket.io";
import type { RateLimiterRes } from "rate-limiter-flexible";

import { pb } from "@/lib/config/pb";
import {
  ChatMessageSchema,
  ChatRoomSchema,
  IntegrationSchema,
  UserSchema,
} from "@/models";
import { rateLimiter } from "@/lib/config/rate-limiter";

import { processAssistantReply } from "@/lib/chat-ai/service";
import { getHistory, updateHistory } from "@/lib/chat-ai/history";
import { globalEncoderService } from "@/lib/chat-ai/encoder";

import { useMiddlewares } from "./middleware";

interface JoinRoomDTO {
  chatId: string;
  roomId: string;
  username: string;
}

interface SendMessageDTO {
  chatId: string;
  roomId: string;
  msgStr: string;
}

export function attachSocketIO(httpServer: any) {
  const io = new IOServer(httpServer);

  useMiddlewares(io);

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on("join-room", async ({ roomId }: JoinRoomDTO) => {
      const room = ChatRoomSchema.parse(
        await pb.collection("rooms").getOne(roomId, { expand: "chat" })
      );

      if (socket.data.guest) {
        if (socket.data.guest.roomId !== roomId) {
          socket.emit("unauthorized", {
            message: "Unauthorized",
          });
          return;
        }
      } else if (socket.data.user) {
        const user = UserSchema.parse(socket.data.user);
        const chat = room.expand!.chat!;
        const project = await pb
          .collection("projects")
          .getFirstListItem(`chats:each ?= '${chat.id}'`);
        const projects = user.expand!.orgMembers!.flatMap(
          (m) => m.expand!.org!.projects
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

      socket.join(roomId);
      if (!socket.data.authorizedRooms) socket.data.authorizedRooms = new Set();
      socket.data.authorizedRooms.add(roomId);

      const integration = IntegrationSchema.parse(
        await pb
          .collection("integrations")
          .getFirstListItem(`chat="${room.chat}"`)
      );

      try {
        const history = await getHistory(integration.id, roomId);
        socket.emit("chat-history", history);
      } catch (err) {
        console.error("Error in getHistory:", err);
        socket.emit("chat-history", []);
      }
    });

    socket.on("send-message", async ({ roomId, msgStr }: SendMessageDTO) => {
      if (
        !socket.data.authorizedRooms ||
        !socket.data.authorizedRooms.has(roomId)
      ) {
        socket.emit("unauthorized", { message: "Unauthorized" });
        return;
      }

      const msg = ChatMessageSchema.parse(JSON.parse(msgStr));
      if (socket.data.user) {
        await updateHistory([msg]);
        io.to(roomId).emit("new-message", msg);
        return;
      }

      if (
        globalEncoderService.countTokens(msg.content, "gpt-4") >
        parseInt(process.env.PUBLIC_CHAT_MAX_MESSAGE_TOKENS!)
      ) {
        socket.emit("msg-length-limit", {
          message: "Message is too long!",
        });
        return;
      }

      // Rate limiting: Use room + user ID for more secure limiting
      const userId = socket.data.user?.id || socket.data.guest?.username;
      const limiterKey = `room:${roomId}:user:${userId}`;

      try {
        await rateLimiter.consume(limiterKey, 1);
        io.to(roomId).emit("new-message", msg);

        let room = ChatRoomSchema.parse(
          await pb.collection("rooms").getOne(roomId)
        );
        if (room.status === "seeded") {
          room = ChatRoomSchema.parse(
            await pb.collection("rooms").update(roomId, {
              status: "auto",
            })
          );
        }

        const integration = IntegrationSchema.parse(
          await pb
            .collection("integrations")
            .getFirstListItem(`chat="${room.chat}"`)
        );

        try {
          await updateHistory([msg]);
          if (room.status !== "auto") return;

          const newAssistantMsg = await processAssistantReply(
            integration.id,
            roomId
          );
          io.to(roomId).emit("new-message", newAssistantMsg);
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        const res = err as RateLimiterRes;
        const retrySec = Math.ceil((res.msBeforeNext || 0) / 1000);
        socket.emit("rate-limit", {
          message: `Rate limit exceeded. Try again in ${retrySec} second(s).`,
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
