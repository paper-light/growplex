import { z } from "zod";
import { AgentsProviderOptions } from "../pocketbase-types";

export const CreateAgentDTOSchema = z.object({
  projectId: z.string().min(1),

  name: z.string().default("New Agent"),
  system: z.string().default("Add >_< after each message"),
  provider: z.enum(AgentsProviderOptions).default(AgentsProviderOptions.openai),

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
