import { ChatOpenAI } from "@langchain/openai";

import { getEnv } from "@/shared/helpers/get-env";

export const QUERY_CREATOR_MODEL = "gpt-5-nano";
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

export const queryCreatorBaseModel = new ChatOpenAI({
  model: QUERY_CREATOR_MODEL,
  apiKey: OPENAI_API_KEY,
  // temperature: 0.2,
  // maxCompletionTokens: 8192,
});
