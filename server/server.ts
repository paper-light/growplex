// server.ts
import "dotenv/config";

import express from "express";
import http from "http";
import { Server as IOServer, Socket } from "socket.io";
import { handler as astroHandler } from "../dist/server/entry.mjs";

import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import Redis from "ioredis";

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379/0"
);

// Rate limiter: allow 1 message every 2 seconds per socket (adjust as needed)
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "socket_chat_rl",
  points: 1, // 1 message
  duration: 2, // per 2 seconds
});

async function main() {
  app.use(express.static("dist/client"));
  app.use(astroHandler);

  const httpServer = http.createServer(app);
  const io = new IOServer(httpServer);

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on(
      "join-room",
      async ({ roomId, username }: { roomId: string; username: string }) => {
        socket.join(roomId);
        socket.data.username = username;

        // Fetch last 100 messages from Redis list for this room
        const key = `history:${roomId}`;
        try {
          const rawHistory = await redisClient.lrange(key, -100, -1);
          const history = rawHistory.map((raw) => JSON.parse(raw));
          socket.emit("chat-history", history);
        } catch (err) {
          console.error("Error fetching chat history from Redis:", err);
          socket.emit("chat-history", []);
        }
      }
    );

    socket.on(
      "send-message",
      async ({ roomId, text }: { roomId: string; text: string }) => {
        // Rate-limit key: use socket.id (or user ID if you have authentication)
        const limiterKey = socket.id;

        try {
          // Attempt to consume 1 point
          await rateLimiter.consume(limiterKey, 1);

          const msg = {
            text,
            sender: socket.data.username || "anonymous",
            timestamp: Date.now(),
          };

          // Store in Redis list (append to the right)
          const key = `history:${roomId}`;
          const raw = JSON.stringify(msg);
          // Push the new message
          await redisClient.rpush(key, raw);
          // Trim the list to keep only the last 100 entries
          await redisClient.ltrim(key, -100, -1);

          // Broadcast to all clients in the room
          io.to(roomId).emit("new-message", msg);
        } catch (err) {
          // `err` can be `RateLimiterRes`
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

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
