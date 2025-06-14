import z from "zod";

export const ChatThemeSchema = z.object({
  light: z.record(z.string(), z.string()),
  dark: z.record(z.string(), z.string()),
});

export const ChatSchema = z.object({
  id: z.string(),
  domain: z.string(),
  avatar: z.string(),
  firstMessage: z.string(),
  theme: ChatThemeSchema,
  expand: z
    .object({
      agent: z.any(),
    })
    .optional(),

  created: z.string(),
  updated: z.string(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.any(),
  role: z.union([
    z.literal("assistant"),
    z.literal("user"),
    z.literal("operator"),
  ]),
  visible: z.boolean(),
  room: z.string(),
  sentBy: z.string(),
  created: z.string(),
});
