import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { getEnv } from "@/shared/helpers/get-env";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const PROMPT_TEMPLATE = `
You are an enhancer agent. You need to create a query for search engine.
Write query in a way that will return the most relevant results.
Return keywords that are most relevant to the user's query in context of your domain.
Return entities that are most relevant to the user's query in context of your domain.

History: {history}

Original query: {query}

Enhanced query:
`;

const ReturnSchema = z.object({
  enhancedQuery: z.string(),
  keywords: z.array(z.string()),
  entities: z.array(z.string()),
});

const enhancerPromptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

const enhancerBaseModel = new ChatOpenAI({
  model: "gpt-4.1-nano",
  temperature: 0.1,
  apiKey: OPENAI_API_KEY,
});

export const enhancerChain = enhancerPromptTemplate.pipe(
  enhancerBaseModel.withStructuredOutput(ReturnSchema)
);

export async function callEnhancer(query: string, history: string) {
  const result = await enhancerChain.invoke({ query, history });
  return result;
}
