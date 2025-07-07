import z from "zod";

import { AgentSchema } from "./agent";
import { ChatSchema } from "./chat";
import { sourceschema } from "./knowledge";

export const IntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  agent: z.string(),
  chat: z.string(),
  sources: z.array(z.string()),
  expand: z
    .object({
      agent: AgentSchema.optional(),
      chat: ChatSchema.optional(),
      sources: z.array(sourceschema).optional(),
    })
    .optional(),

  created: z.string(),
  updated: z.string(),
});
