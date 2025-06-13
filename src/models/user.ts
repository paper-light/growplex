import z from "zod";

export const CreateUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string(),

  name: z.string(),
  avatar: z.string(),
  verified: z.boolean(),
  metadata: z.any(),

  created: z.string(),
  updated: z.string(),
});
