import z from "zod";

export const ChatThemeSchema = z.object({
  light: z.record(z.string(), z.string()),
  dark: z.record(z.string(), z.string()),
});

export const ChatSchema = z.object({
  id: z.string(),
  domain: z.string(),
  theme: ChatThemeSchema,
});
