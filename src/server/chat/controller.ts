import { Server as IOServer, Socket } from "socket.io";
import type { RateLimiterRes } from "rate-limiter-flexible";

import { rateLimiter } from "@/lib/config/rate-limiter";

import { processAssistantReply } from "@/lib/chat-ai/service";
import { getHistory, updateHistory } from "@/lib/chat-ai/history";

import { useMiddlewares } from "./middleware";

export function attachSocketIO(httpServer: any) {
  const io = new IOServer(httpServer);

  useMiddlewares(io);

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on(
      "join-room",
      async ({ roomId, username }: { roomId: string; username: string }) => {
        socket.join(roomId);

        socket.data.username = username;
        socket.data.roomId = roomId;

        try {
          const history = await getHistory(roomId);
          socket.emit("chat-history", history);
        } catch (err) {
          console.error("Error in getHistory:", err);
          socket.emit("chat-history", []);
        }
      }
    );

    socket.on(
      "send-message",
      async ({ roomId, msgStr }: { roomId: string; msgStr: string }) => {
        const msg = JSON.parse(msgStr);

        const limiterKey = socket.id;
        try {
          await rateLimiter.consume(limiterKey, 1);

          await updateHistory([msg]);

          const newAssistantMsg = await processAssistantReply(roomId);

          io.to(roomId).emit("new-message", newAssistantMsg);
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
