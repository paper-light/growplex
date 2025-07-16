import { z } from "zod";

export const CreateChatDTOSchema = z.object({
  projectId: z.string().min(1),
  chat: z
    .object({
      name: z.string(),
      domain: z.string(),
      firstMessage: z.string(),
    })
    .default({
      name: "New Chat",
      domain: "",
      firstMessage: "Hello, I am your new chatbot. How can I help you today?",
    }),
  integrationId: z.string().optional(),
});
