import { z } from "zod";
import { OrgSchema } from "./org";
import { ProjectSchema } from "./project";

export const SettingsSchema = z.object({
  currentOrg: OrgSchema.nullable(),
  currentProject: ProjectSchema.nullable(),
});
