import { actions } from "astro:actions";

import { pb } from "../../shared/lib/pb";

export const signUp = async (
  email: string,
  password: string,
  passwordConfirm: string,
  name: string
) => {
  const user = await pb.collection("users").create({
    email,
    password,
    passwordConfirm,
    name,
  });

  await actions.seedUser({ userId: user.id, provider: null });
};
