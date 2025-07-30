import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { getEnv } from "@/shared/helpers/get-env";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const PROMPT_TEMPLATE = `
You are an summary agent. You need to create a summary of the search results.
Return summary of the search results.
Return queryFullfilled if the query was fullfilled by the search results.

Search results: {results}

Search summary:
`;

const ReturnSchema = z.object({
  summary: z.string(),
  queryFullfilled: z.boolean(),
});

const summaryPromptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

const summaryBaseModel = new ChatOpenAI({
  model: "gpt-4.1-nano",
  temperature: 0.1,
  apiKey: OPENAI_API_KEY,
});

export const summaryChain = summaryPromptTemplate.pipe(
  summaryBaseModel.withStructuredOutput(ReturnSchema)
);

export async function callSummary(results: string) {
  const result = await summaryChain.invoke({ results });
  return result;
}
