import { z } from "zod";

export const CreateChatDTOSchema = z.object({
  project: z.string().min(1),
  integration: z.string().optional(),

  name: z.string().default("New Chat"),
  domain: z.url().default("https://example.com"),
  firstMessage: z
    .string()
    .default("Hello, I am your new chatbot. How can I help you today?"),
  avatar: z.instanceof(File).optional(),
});
export type CreateChatDTO = z.infer<typeof CreateChatDTOSchema>;

export const UpdateChatDTOSchema = z.object({
  id: z.string().min(1),
  integration: z.string().optional(),

  name: z.string().optional(),
  domain: z.url().optional(),
  firstMessage: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});
export type UpdateChatDTO = z.infer<typeof UpdateChatDTOSchema>;
