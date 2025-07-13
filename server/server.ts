// server.ts
import "dotenv/config";

import { handler as astroHandler } from "../dist/server/entry.mjs";
import { main } from "./main";

main(astroHandler).catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
