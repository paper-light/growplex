import * as hub from "langchain/hub/node";
import { ChatOpenAI } from "@langchain/openai";
import type { StructuredTool } from "@langchain/core/tools";

import { getEnv } from "@/shared/helpers/get-env";

import { updateLead, createTicket, callOperator } from "./tools";

const ENV = getEnv("ENV");
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const assistantPromptTemplate = await hub.pull(`chat-system:${ENV}`, {
  includeModel: false,
});

const assistantTools: StructuredTool[] = [
  updateLead,
  createTicket,
  callOperator,
];

export const assistantToolsMap = assistantTools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, StructuredTool>);

const openaiToolsModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 1,
  // maxTokens: MAX_TOKENS,
  apiKey: OPENAI_API_KEY,
}).bindTools(assistantTools);

const openaiModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 1,
  // maxTokens: MAX_TOKENS,
  apiKey: OPENAI_API_KEY,
});

export const assistantAgent = assistantPromptTemplate.pipe(openaiToolsModel);

export const finalStepAgent = assistantPromptTemplate.pipe(openaiModel);
