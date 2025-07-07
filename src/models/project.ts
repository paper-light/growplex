import z from "zod";

import { AgentSchema } from "./agent";
import { SourceSchema } from "./knowledge";
import { ChatSchema } from "./chat";
import { IntegrationSchema } from "./integration";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  agents: z.array(z.string()),
  sources: z.array(z.string()),
  chats: z.array(z.string()),
  operators: z.array(z.string()),
  integrations: z.array(z.string()),
  expand: z
    .object({
      agents: z.array(AgentSchema).optional(),
      sources: z.array(SourceSchema).optional(),
      chats: z.array(ChatSchema).optional(),
      integrations: z.array(IntegrationSchema).optional(),
    })
    .optional(),
  created: z.string(),
  updated: z.string(),
});
