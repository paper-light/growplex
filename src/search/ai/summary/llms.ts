import { ChatOpenAI } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

export const SEARCH_SUMMARY_MODEL = "gpt-5-nano";
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const summaryBaseModel = new ChatOpenAI({
  model: SEARCH_SUMMARY_MODEL,
  apiKey: OPENAI_API_KEY,
  // temperature: 0.2,
  // maxCompletionTokens: 8192,
});
