import { Server as IOServer, Socket } from "socket.io";
import type { RateLimiterRes } from "rate-limiter-flexible";

import { redisClient } from "../config/redis";
import { rateLimiter } from "../config/rate-limiter";
import { pb } from "../config/pb";

interface ChatMessage {
  text: string;
  sender: string;
  timestamp: number;
}

async function ensureSuperuser() {
  if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
    const PB_ID = process.env.PB_ID!;
    const PB_PASSWORD = process.env.PB_PASSWORD!;
    const authData = await pb
      .collection("_superusers")
      .authWithPassword(PB_ID, PB_PASSWORD);
    pb.authStore.save(authData.token, authData.record);
  }
}

export function attachSocketIO(httpServer: any) {
  const io = new IOServer(httpServer);

  io.use(async (socket, next) => {
    try {
      await ensureSuperuser();
      next();
    } catch (err) {
      console.error("⚠️  PocketBase superuser re-auth failed:", err);
      next(new Error("Internal auth error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on(
      "join-room",
      async ({ roomId, username }: { roomId: string; username: string }) => {
        socket.join(roomId);
        socket.data.username = username;

        const redisKey = `history:${roomId}`;

        try {
          const rawHistory = await redisClient.lrange(redisKey, -100, -1);
          if (rawHistory.length > 0) {
            const historyFromRedis: ChatMessage[] = rawHistory.map((raw) =>
              JSON.parse(raw)
            );
            socket.emit("chat-history", historyFromRedis);
          } else {
            console.log(
              `ℹ️  Redis empty for room ${roomId}, fetching from PocketBase…`
            );

            const historyFromPB = await pb
              .collection("messages")
              .getList(1, 100, {
                filter: `room = "${roomId}" & visible = true`,
                sort: "created",
              });

            socket.emit("chat-history", historyFromPB.items);

            await Promise.all(
              historyFromPB.items.map((msg) =>
                redisClient.rpush(redisKey, JSON.stringify(msg))
              )
            );
            await redisClient.ltrim(redisKey, -100, -1);
          }
        } catch (err) {
          console.error("Error fetching chat history:", err);
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

          const redisKey = `history:${roomId}`;
          await redisClient.rpush(redisKey, msgStr);
          await redisClient.ltrim(redisKey, -100, -1);

          try {
            await pb.collection("messages").create({
              sentBy: msg.sentBy,
              visible: true,
              role: msg.role,
              content: msg.content,
              room: roomId,
            });
          } catch (pbError) {
            console.warn("⚠️  Failed to save message in PocketBase:", pbError);
          }

          const newMsg = await pb.collection("messages").create({
            content: `"${msg.content}" - YOURS`,
            role: "assistant",
            visible: true,
            room: roomId,
            sentBy: "KATE LOL",
          });

          await redisClient.rpush(redisKey, JSON.stringify(newMsg));
          await redisClient.ltrim(redisKey, -100, -1);

          io.to(roomId).emit("new-message", newMsg);
        } catch (err) {
          const res = err as RateLimiterRes;
          const retrySec = Math.ceil((res.msBeforeNext || 0) / 1000);
          socket.emit("rate-limit", {
            message: `Rate limit exceeded. Try again in ${retrySec} second(s).`,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
