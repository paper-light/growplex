import { z } from "astro:schema";
import { seed } from "../../auth/seed-user";

export const SeedUserSchema = z.object({
  userId: z.string(),
  provider: z.enum(["google"]).nullable(),
});

export const seedHandler = async (input: z.infer<typeof SeedUserSchema>) => {
  try {
    await seed(input.userId, input.provider);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
