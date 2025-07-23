import { z } from "zod";

export const UpdateUserDTOSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.email().optional(),
  avatar: z.instanceof(File).optional(),

  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
  oldPassword: z.string().optional(),
});
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;
