import { z } from "zod";
import { OrgSchema } from "./org";
import { ProjectSchema } from "./project";
import { IntegrationSchema } from "./integration";

export const SettingsSchema = z.object({
  currentOrg: OrgSchema.nullable(),
  currentProject: ProjectSchema.nullable(),
  currentIntegration: IntegrationSchema.nullable()
});
