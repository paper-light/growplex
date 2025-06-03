// server.ts
import "dotenv/config";

import express from "express";
import http from "http";
import { Server as IOServer, Socket } from "socket.io";
import { handler as astroHandler } from "../dist/server/entry.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  app.use(express.static("dist/client"));

  app.use(astroHandler);

  const httpServer = http.createServer(app);

  const io = new IOServer(httpServer, {
    // Since your iframe and backend share the same origin, you probably don't need extra CORS config.
    // If you ever host them on different subdomains, you can add:
    // cors: { origin: "https://your-chat-domain.com" }
  });

  const messagesByRoom: Record<
    string,
    Array<{ text: string; sender: string; timestamp: number }>
  > = {};

  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on(
      "join-room",
      ({ roomId, username }: { roomId: string; username: string }) => {
        socket.join(roomId);
        socket.data.username = username;

        const history = messagesByRoom[roomId] || [];
        socket.emit("chat-history", history);
      }
    );

    socket.on(
      "send-message",
      ({ roomId, text }: { roomId: string; text: string }) => {
        const msg = {
          text,
          sender: socket.data.username || "anonymous",
          timestamp: Date.now(),
        };

        if (!messagesByRoom[roomId]) {
          messagesByRoom[roomId] = [];
        }
        messagesByRoom[roomId].push(msg);

        if (messagesByRoom[roomId].length > 100) {
          messagesByRoom[roomId].shift();
        }

        io.to(roomId).emit("new-message", msg);
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
