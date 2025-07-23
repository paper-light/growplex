import { z } from "zod";

export const UpdateOrgDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type UpdateOrgDTO = z.infer<typeof UpdateOrgDTOSchema>;
