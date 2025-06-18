import { actions } from "astro:actions";

import { UserSchema } from "../../models";
import { pb, authProvider } from "./auth.svelte";

export const oauth2 = async (provider: string) => {
  const userResult = await pb.collection("users").authWithOAuth2({
    provider,
  });
  if (!userResult) {
    return;
  }

  const user = UserSchema.parse(userResult.record);
  if (user.orgMembers.length === 0) {
    await actions.seedUser(user);
    await authProvider.refreshUser();
  } else {
    await authProvider.refreshUser();
  }
};
