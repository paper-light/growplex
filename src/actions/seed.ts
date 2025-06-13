import z from "zod";

import type { UserSchema } from "../models";
import { seed } from "../lib/auth/seed";

export const seedHandler = async (user: z.infer<typeof UserSchema>) => {
  try {
    await seed(user);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
