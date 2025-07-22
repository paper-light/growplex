import { actions } from "astro:actions";

import { pb } from "../../shared/lib/pb";
import { initData } from "../../user/init-data";
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

  await initData();
};
