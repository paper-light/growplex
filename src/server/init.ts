import express from "express";
import http from "http";

import { attachSocketIO } from "./chat/controller";
import { pbAdminMiddleware } from "./auth/middleware";

import { submitCrawl } from "../lib/crawl4ai/service";

const app = express();
const PORT = process.env.PORT || 3000;

export async function main(astroHandler: any) {
  const res = await submitCrawl(["https://www.google.com"]);
  console.log(res);

  app.use(pbAdminMiddleware);
  app.use(express.static("dist/client"));
  app.use(astroHandler);

  const httpServer = http.createServer(app);
  attachSocketIO(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server (HTTP + WS) listening on http://localhost:${PORT}`);
  });
}
