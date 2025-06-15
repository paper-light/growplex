import z from "zod";
import { OrgMemberSchema } from "./org";

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

  orgMembers: z.array(z.string()),

  created: z.string(),
  updated: z.string(),

  expand: z
    .object({
      orgMembers: z.array(OrgMemberSchema).optional(),
    })
    .optional(),
});
