import * as hub from "langchain/hub/node";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { getEnv } from "../../helpers/get-env";

const ENV = getEnv("ENV");
const MAX_TOKENS = parseInt(getEnv("PUBLIC_CHAT_MAX_MESSAGE_TOKENS"));

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");
const GOOGLE_API_KEY = getEnv("GOOGLE_API_KEY");
const ANTHROPIC_API_KEY = getEnv("ANTHROPIC_API_KEY");

export const mainPrompt = await hub.pull(`chat-system:${ENV}`, {
  includeModel: false,
});

const openaiModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 1,
  maxTokens: MAX_TOKENS,
  apiKey: OPENAI_API_KEY,
});

const googleModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  temperature: 1,
  maxOutputTokens: MAX_TOKENS,
  apiKey: GOOGLE_API_KEY,
});

const anthropicModel = new ChatAnthropic({
  model: "claude-3-haiku-20240307",
  temperature: 1,
  maxTokens: MAX_TOKENS,
  apiKey: ANTHROPIC_API_KEY,
});

const selectModel = (provider: "openai" | "anthropic" | "google") => {
  switch (provider) {
    case "openai":
      return openaiModel;
    case "anthropic":
      return anthropicModel;
    case "google":
      return googleModel;
  }
};

export const getChain = (provider: "openai" | "anthropic" | "google") => {
  const llm = selectModel(provider);
  return mainPrompt.pipe(llm);
};
