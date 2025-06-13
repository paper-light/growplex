import { actions } from "astro:actions";

import { UserSchema } from "../../models";
import { authProvider } from "./auth.svelte";

export const oauth2 = async (provider: string) => {
  const userResult = await authProvider.pb
    .collection("users")
    .authWithOAuth2({ provider });
  if (!userResult) {
    return;
  }

  const user = UserSchema.parse(userResult.record);

  if (user.created === user.updated) {
    await actions.seedUser(user);
  }
};
