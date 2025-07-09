import { actions } from "astro:actions";

import { pb } from "../../shared/lib/pb";
import { authProvider } from "./auth.svelte";
import type { UsersResponse } from "../../shared/models/pocketbase-types";
import type { UserExpand } from "../../shared/models/expands";

export const oauth2 = async (provider: string) => {
  const userResult = await pb.collection("users").authWithOAuth2({
    provider,
  });
  if (!userResult) {
    return;
  }
  const user = userResult.record as UsersResponse<unknown, UserExpand>;
  pb.authStore.save(userResult.token, user);

  if (user.orgMembers.length === 0) {
    await actions.seedUser({ userId: user.id, provider: provider as "google" });
  }

  await authProvider.refreshUser();
  await authProvider.subscribeUser();
};
