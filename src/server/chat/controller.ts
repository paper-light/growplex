import { Server as IOServer, Socket } from "socket.io";
import type { RateLimiterRes } from "rate-limiter-flexible";

import { ChatMessageSchema, IntegrationSchema } from "@/models";
import { rateLimiter } from "@/lib/config/rate-limiter";

import { processAssistantReply } from "@/lib/chat-ai/service";
import { getHistory, updateHistory } from "@/lib/chat-ai/history";

import { useMiddlewares } from "./middleware";
import { pb } from "@/lib/config/pb";

const MAX_MESSAGE_CHARS =
  parseInt(process.env.PUBLIC_CHAT_MAX_MESSAGE_TOKENS!) * 0.75 * 4.5;

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

    socket.on(
      "join-room",
      async ({ chatId, roomId, username }: JoinRoomDTO) => {
        socket.join(roomId);

        if (!socket.data.user) {
          socket.emit("unauthorized", {
            message: "Unauthorized",
          });
          return;
        }

        socket.data.username = username;
        socket.data.roomId = roomId;

        const integration = IntegrationSchema.parse(
          await pb
            .collection("integrations")
            .getFirstListItem(`chat="${chatId}"`)
        );

        try {
          const history = await getHistory(integration.id, roomId);
          socket.emit("chat-history", history);
        } catch (err) {
          console.error("Error in getHistory:", err);
          socket.emit("chat-history", []);
        }
      }
    );

    socket.on(
      "send-message",
      async ({ chatId, roomId, msgStr }: SendMessageDTO) => {
        const msg = ChatMessageSchema.parse(JSON.parse(msgStr));

        if (!socket.data.user) {
          socket.emit("unauthorized", {
            message: "Unauthorized",
          });
          return;
        }

        if (msg.content.length > MAX_MESSAGE_CHARS) {
          socket.emit("msg-length-limit", {
            message: "Message is too long!",
          });
          return;
        }

        const limiterKey = socket.id;
        try {
          await rateLimiter.consume(limiterKey, 1);

          const integration = IntegrationSchema.parse(
            await pb
              .collection("integrations")
              .getFirstListItem(`chat="${chatId}"`)
          );

          try {
            await updateHistory([msg]);
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
      }
    );

    socket.on("disconnect", async () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
