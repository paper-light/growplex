import z from "zod";

import { AgentSchema } from "./agent";
import { KnowledgeSourceSchema } from "./knowledge";
import { ChatSchema } from "./chat";
import { IntegrationSchema } from "./integration";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  agents: z.array(z.string()),
  knowledgeSources: z.array(z.string()),
  chats: z.array(z.string()),
  operators: z.array(z.string()),
  integrations: z.array(z.string()),
  expand: z
    .object({
      agents: z.array(AgentSchema).optional(),
      knowledgeSources: z.array(KnowledgeSourceSchema).optional(),
      chats: z.array(ChatSchema).optional(),
      integrations: z.array(IntegrationSchema).optional(),
    })
    .optional(),
  created: z.string(),
  updated: z.string(),
});
