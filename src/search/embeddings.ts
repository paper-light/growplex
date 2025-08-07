import { OpenAIEmbeddings } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: OPENAI_API_KEY,
});
