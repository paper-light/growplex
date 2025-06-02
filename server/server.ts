import "dotenv/config";

import express from "express";
import { handler as astroHandler } from "../dist/server/entry.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  app.use(express.static("dist/client"));

  app.use(astroHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
