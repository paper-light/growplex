import z from "zod";

import { RunnableLambda } from "@langchain/core/runnables";

export const EnhancerReturnSchema = z.object({
  enhancedQuery: z
    .string()
    .describe(
      "The enhanced search query that will be used to find relevant information. This should be a clear, specific query that will return the most relevant results."
    ),
  keywords: z
    .array(z.string())
    .describe(
      "An array of relevant keywords extracted from the user's question. These help focus the search on the most important terms."
    ),
  entities: z
    .array(z.string())
    .describe(
      "An array of named entities (people, places, organizations, etc.) mentioned in the user's question that should be included in the search."
    ),
});

// const PROMPT_TEMPLATE_START = `
// You are an enhancer agent. You need to create a query for search engine.
// Write query in a way that will return the most relevant results.
// Return keywords that are most relevant to the user's query in context of your domain.
// Return entities that are most relevant to the user's query in context of your domain.

// Original query: {query}

// Enhanced query:
// `;

// const enhancerPromptTemplate = PromptTemplate.fromTemplate(
//   PROMPT_TEMPLATE_START
// );

// const enhancerBaseModel = new ChatOpenAI({
//   model: "gpt-4.1-mini",
//   temperature: 0.1,
//   apiKey: OPENAI_API_KEY,
//   maxTokens: 1024,
// });

// export const enhancerChain = enhancerPromptTemplate.pipe(
//   enhancerBaseModel.withStructuredOutput(EnhancerReturnSchema)
// );

export const enhancerResultToString = RunnableLambda.from(
  async (input: z.infer<typeof EnhancerReturnSchema>) => {
    return `
    Enhanced query: ${input.enhancedQuery}
    Keywords: ${input.keywords.join(", ")}
    Entities: ${input.entities.join(", ")}
    `;
  }
);
