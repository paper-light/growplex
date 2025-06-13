import z from "zod";

import { AgentSchema } from "./agent";
import { ChatSchema } from "./chat";
import { KnowledgeSourceSchema } from "./knowledge";

export const IntegrationSchema = z.object({
  id: z.string(),
  agent: z.string(),
  chat: z.string(),
  knowledgeSources: z.array(z.string()),
  expand: z
    .object({
      agent: AgentSchema.optional(),
      chat: ChatSchema.optional(),
      knowledgeSources: z.array(KnowledgeSourceSchema).optional(),
    })
    .optional(),

  created: z.string(),
  updated: z.string(),
});
