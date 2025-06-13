import z from "zod";

export const AgentSchema = z.object({
  id: z.string(),
  system: z.string(),
  name: z.string(),
  contact: z.string(),
  provider: z.union([
    z.literal("openai"),
    z.literal("anthropic"),
    z.literal("deepseek"),
    z.literal("google"),
  ]),

  created: z.string(),
  updated: z.string(),
});
