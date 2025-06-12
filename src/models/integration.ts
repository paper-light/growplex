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
      agent: AgentSchema.nullable(),
      chat: ChatSchema.nullable(),
      knowledgeSources: z.array(KnowledgeSourceSchema),
    })
    .optional(),
});
