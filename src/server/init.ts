import express from "express";
import http from "http";

import { attachSocketIO } from "./chat/controller";
import { pbAdminMiddleware } from "./auth/middleware";

const app = express();
const PORT = process.env.PORT || 3000;

export async function main(astroHandler: any) {
  app.use(pbAdminMiddleware);
  app.use(express.static("dist/client"));
  app.use(astroHandler);

  const httpServer = http.createServer(app);
  attachSocketIO(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) listening on http://localhost:${PORT}`);
  });
}
