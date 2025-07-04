import { actions } from "astro:actions";

import { UserSchema } from "../../models";
import { pb } from "./pb";
import { authProvider } from "./auth.svelte";

export const oauth2 = async (provider: string) => {
  const userResult = await pb.collection("users").authWithOAuth2({
    provider,
  });
  if (!userResult) {
    return;
  }
  pb.authStore.save(userResult.token, userResult.record);

  const user = UserSchema.parse(userResult.record);

  if (user.orgMembers.length === 0) {
    await actions.seedUser({ user, provider: provider as "google" });
  }

  await authProvider.refreshUser();
  await authProvider.subscribeUser();
};
