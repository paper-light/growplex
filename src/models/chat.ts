import z from "zod";

export const ChatSchema = z.object({
  id: z.string(),
  domain: z.string(),
});
