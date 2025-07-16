import { z } from "zod";
import { AgentsProviderOptions } from "../pocketbase-types";

export const CreateAgentDTOSchema = z.object({
  projectId: z.string().min(1),
  agent: z
    .object({
      name: z.string(),
      system: z.string(),
      provider: z.enum(AgentsProviderOptions),
    })
    .default({
      name: "New Agent",
      system: "Add >_< after each message",
      provider: AgentsProviderOptions.openai,
    }),
  integrationId: z.string().optional(),
});
