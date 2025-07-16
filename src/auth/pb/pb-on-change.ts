import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import type { UsersResponse } from "../../shared/models/pocketbase-types";
import type { UserExpandStrict } from "../../shared/models/expands";
import { userProvider } from "../../user/user.svelte";
import { uiProvider } from "../../user/ui.svelte";

pb.authStore.onChange((token, rec) => {
  if (rec && pb.authStore.isValid) {
    try {
      const user = rec as UsersResponse<unknown, UserExpandStrict>;
      userProvider.user = user;
      userProvider.token = token;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      userProvider.user = null;
    }
  } else {
    userProvider.user = null;
    userProvider.token = "";
    settingsProvider.clear();
    uiProvider.clear();
  }
}, false);
