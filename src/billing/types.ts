import { z } from "zod";

export type Model =
  | "gpt-5-nano"
  | "gpt-5-mini"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "text-embedding-3-small"
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash";

export const ModelUsageSchema = z.object({
  cache: z.number().default(0),
  in: z.number().default(0),
  out: z.number().default(0),
});
export type ModelUsage = z.infer<typeof ModelUsageSchema>;
