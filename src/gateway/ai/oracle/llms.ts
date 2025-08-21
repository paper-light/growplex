import { ChatOpenAI } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

export const ORACLE_MODEL = "gpt-4.1-mini";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const baseOracleModel = new ChatOpenAI({
  model: ORACLE_MODEL,
  apiKey: OPENAI_API_KEY,
  temperature: 0.4,
  maxTokens: 1024,
  maxRetries: 3,
  // timeout: 10000,
  // frequencyPenalty: 0,
  // presencePenalty: 0,
  // topP: 1,
  // maxCompletionTokens: 512,
});
