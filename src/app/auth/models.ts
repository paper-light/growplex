import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),

  name: z.string(),
  email: z.string().email(),
  tg: z.string(),
  avatar: z.string(),

  verified: z.boolean(),
  created: z.string(),
  updated: z.string(),

  metadata: z.any(),
});
