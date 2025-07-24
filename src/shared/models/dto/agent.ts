import { z } from "zod";
import { AgentsProviderOptions } from "../pocketbase-types";

export const CreateAgentDTOSchema = z.object({
  projectId: z.string().min(1),

  name: z.string().optional(),
  system: z.string().optional(),
  provider: z.enum(AgentsProviderOptions).optional(),

  integrationId: z.string().optional(),
});
export type CreateAgentDTO = z.input<typeof CreateAgentDTOSchema>;

export const UpdateAgentDTOSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  system: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});
export type UpdateAgentDTO = z.input<typeof UpdateAgentDTOSchema>;
