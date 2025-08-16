import z from "zod";

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