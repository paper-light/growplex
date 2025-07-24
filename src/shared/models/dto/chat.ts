import { z } from "zod";

export const CreateChatDTOSchema = z.object({
  project: z.string().min(1),
  integration: z.string().optional(),

  name: z.string().optional(),
  domain: z.url().optional(),
  firstMessage: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});
export type CreateChatDTO = z.infer<typeof CreateChatDTOSchema>;

export const UpdateChatDTOSchema = z.object({
  id: z.string().min(1),
  integration: z.string().optional(),

  name: z.string().optional(),
  domain: z.url().optional(),
  firstMessage: z.string().optional(),
  theme: z
    .object({
      preview: z.string().optional(),
      production: z.string().optional(),
      config: z.any(),
    })
    .optional(),
  avatar: z.instanceof(File).optional(),
});
export type UpdateChatDTO = z.infer<typeof UpdateChatDTOSchema>;
