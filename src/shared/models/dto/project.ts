import { z } from "zod";

export const CreateProjectDTOSchema = z.object({
  org: z.string().min(1),
  name: z.string().optional(),
});
export type CreateProjectDTO = z.infer<typeof CreateProjectDTOSchema>;

export const UpdateProjectDTOSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});
export type UpdateProjectDTO = z.infer<typeof UpdateProjectDTOSchema>;
