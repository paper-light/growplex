import z from "zod";

import type { UserSchema } from "../models";
import { seed } from "../lib/auth/seed";

export const seedHandler = async (input: {
  user: z.infer<typeof UserSchema>;
  provider: "google" | null;
}) => {
  try {
    await seed(input.user, input.provider);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
