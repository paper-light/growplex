import { ChatOpenAI } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

export const INTEGRATION_MANAGER_MODEL = "gpt-5-mini";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const baseIntegrationManagerModel = new ChatOpenAI({
  model: INTEGRATION_MANAGER_MODEL,
  apiKey: OPENAI_API_KEY,
  //   maxCompletionTokens: 512,
  //   temperature: 0.4,
  //   maxTokens: 1024,
  //   maxRetries: 3,
  //   timeout: 10000,
  //   frequencyPenalty: 0,
  //   presencePenalty: 0,
  //   topP: 1,
});
