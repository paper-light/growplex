import z from "zod";

export const ChatSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  avatar: z.string(),
  firstMessage: z.string(),
  theme: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  created: z.string(),
  updated: z.string(),

  expand: z
    .object({
      agent: z.any(),
    })
    .optional(),
});

export const ChatRoomSchema = z.object({
  id: z.string(),
  chat: z.string(),
  status: z.union([
    z.literal("auto"),
    z.literal("waitingOperator"),
    z.literal("operator"),
    z.literal("frozen"),
    z.literal("preview"),
    z.literal("seeded"),
  ]),
  created: z.string(),
  updated: z.string(),

  expand: z
    .object({
      chat: ChatSchema.optional(),
    })
    .optional(),
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

  expand: z
    .object({
      room: ChatRoomSchema.optional(),
    })
    .optional(),
});
