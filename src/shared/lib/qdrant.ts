import { QdrantClient } from "@qdrant/js-client-rest";

import { getEnv } from "../helpers/get-env";

const QDRANT_URL = getEnv("QDRANT_URL");
const QDRANT_API_KEY = getEnv("QDRANT_API_KEY");

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});
