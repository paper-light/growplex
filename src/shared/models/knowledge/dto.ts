import { z } from "zod";

export const CreateSourceDTOSchema = z.object({
  name: z.string(),
  type: z.enum(["web", "file"]),
  metadata: z.object({
    domain: z.string(),
  }),
});
export type CreateSourceDTO = z.infer<typeof CreateSourceDTOSchema>;
