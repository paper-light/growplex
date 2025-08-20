import { ChatOpenAI } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

export const CHAT_CONSULTER_MODEL = "gpt-4.1-mini";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const baseConsulterModel = new ChatOpenAI({
  model: CHAT_CONSULTER_MODEL,
  apiKey: OPENAI_API_KEY,
  maxCompletionTokens: 512,
  temperature: 0.4,
});
