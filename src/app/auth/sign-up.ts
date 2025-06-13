import { actions } from "astro:actions";
import { UserSchema } from "../../models";

import { authProvider } from "./auth.svelte";

export const signUp = async (
  email: string,
  password: string,
  passwordConfirm: string,
  name: string
) => {
  const user = UserSchema.parse(
    await authProvider.pb.collection("users").create({
      email,
      password,
      passwordConfirm,
      name,
    })
  );

  await actions.seedUser(user);
};
