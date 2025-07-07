import z from "zod";

export const sourceschema = z.object({
  id: z.string(),
  name: z.string(),
  created: z.string(),
  updated: z.string(),
});
