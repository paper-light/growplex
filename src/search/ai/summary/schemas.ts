import { z } from "zod";

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
