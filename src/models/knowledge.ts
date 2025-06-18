import z from "zod";

export const KnowledgeSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  created: z.string(),
  updated: z.string(),
});
