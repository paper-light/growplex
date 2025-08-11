import { Meilisearch } from "meilisearch";

import { getEnv } from "@/shared/helpers/get-env";
import { logger } from "@/shared/lib/logger";

import { meiliEmbeddings } from "../embeddings";

const log = logger.child({ name: "search:stores:meili" });

const MEILI_URL = getEnv("MEILI_URL");
const MEILI_API_KEY = getEnv("MEILI_MASTER_KEY");

export const meiliClient = new Meilisearch({
  host: MEILI_URL,
  apiKey: MEILI_API_KEY,
});

export const meiliIndex = meiliClient.index("chunks");

export async function setupMeili() {
  log.info("Setting up Meili");
  try {
    await meiliIndex.updateEmbedders(meiliEmbeddings);
    await meiliIndex.updateFilterableAttributes([
      "sourceId",
      "orgId",
      "documentId",
    ]);
  } catch (error) {
    log.error({ error }, "Error setting up Meili");
    throw error;
  }
}
