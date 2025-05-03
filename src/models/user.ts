import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  createdAt: z.date(),
  updatedAt: z.date(),
});
