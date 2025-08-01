import z from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { getEnv } from "@/shared/helpers/get-env";

const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const PROMPT_TEMPLATE = `
You are a strict search summary agent. Your ONLY job is to create a summary based EXCLUSIVELY on the search results provided.

CRITICAL RULES:
1. ONLY use information that is EXPLICITLY present in the search results
2. DO NOT make assumptions, inferences, or add external knowledge
3. If the search results don't contain relevant information for the query, mark success as FALSE
4. Be extremely conservative - if you're unsure about relevance, mark success as FALSE
5. The summary must be factual and directly derived from the search results
6. Do not include any information not found in the search results

Query: {query}

Search results: {results}

Search summary:
`;

export const SummaryReturnSchema = z.object({
  content: z
    .string()
    .describe(
      "Summary of the search results. ONLY include information explicitly present in the search results. Do not add external knowledge or assumptions."
    ),
  success: z
    .boolean()
    .describe(
      "Whether the query was fulfilled by the search results. Mark FALSE if search results don't contain relevant information or if unsure about relevance."
    ),
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
