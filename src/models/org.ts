import z from "zod";

import { ProjectSchema } from "./project";

export const OrgSchema = z.object({
  id: z.string(),
  projects: z.array(z.string()),
  expand: z
    .object({
      projects: z.array(ProjectSchema).optional(),
    })
    .optional(),
  created: z.string(),
  updated: z.string(),
});

export const OrgMemberSchema = z.object({
  id: z.string(),
  org: z.string(),
  role: z.union([z.literal("owner"), z.literal("operator")]),
  created: z.string(),
  updated: z.string(),
});
