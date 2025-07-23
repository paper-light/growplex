import { z } from "zod";

export const CreateIntegrationDTOSchema = z.object({
  project: z.string().min(1),

  name: z.string().default("New Integration"),
  agents: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  operators: z.array(z.string()).default([]),
  //   chats: z.array(z.string()).default([]),
});
export type CreateIntegrationDTO = z.input<typeof CreateIntegrationDTOSchema>;

export const UpdateIntegrationDTOSchema = z.object({
  id: z.string().min(1),

  name: z.string().optional(),
  addAgents: z.array(z.string()).default([]),
  removeAgents: z.array(z.string()).default([]),
  addSources: z.array(z.string()).default([]),
  removeSources: z.array(z.string()).default([]),
  addOperators: z.array(z.string()).default([]),
  removeOperators: z.array(z.string()).default([]),

  // addChats: z.array(z.string()).default([]),
  // removeChats: z.array(z.string()).default([]),
});
export type UpdateIntegrationDTO = z.input<typeof UpdateIntegrationDTOSchema>;
