import { seed } from "../../lib/auth/seed";

export const seedHandler = async (input: {
  userId: string;
  provider: "google" | null;
}) => {
  try {
    await seed(input.userId, input.provider);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
