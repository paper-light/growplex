import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { getEnv } from "@/shared/helpers/get-env";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const PROMPT_TEMPLATE = `
You are an summary agent. You need to create a summary of the search results.
Return summary of the search results.
Return queryFullfilled if the query was fullfilled by the search results.

Query: {query}

Search results: {results}

Search summary:
`;

export const SummaryReturnSchema = z.object({
  content: z
    .string()
    .describe(
      "Summary of the search results. Provide the most relevant information in useful way"
    ),
  success: z
    .boolean()
    .describe("Whether the query was fullfilled by the search results"),
});

const summaryPromptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

const summaryBaseModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.2,
  apiKey: OPENAI_API_KEY,
  maxTokens: 16384,
});

export const summaryChain = summaryPromptTemplate.pipe(
  summaryBaseModel.withStructuredOutput(SummaryReturnSchema)
);
