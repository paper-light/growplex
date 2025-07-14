// server.ts
import "dotenv/config";

import express from "express";
import http from "http";

import { handler as astroHandler } from "../dist/server/entry.mjs";

import { attachSocketIO } from "./socket.io/controller";

const app = express();
const PORT = process.env.PORT || 3000;

export async function start() {
  app.use(express.static("dist/client"));
  app.use(astroHandler);

  const httpServer = http.createServer(app);
  attachSocketIO(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
