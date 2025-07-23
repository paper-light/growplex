import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import type { UsersResponse } from "../../shared/models/pocketbase-types";
import { userProvider } from "../../user/user.svelte";
import { uiProvider } from "../../user/ui.svelte";

pb.authStore.onChange((_, rec) => {
  if (rec && pb.authStore.isValid) {
    try {
      const user = rec as UsersResponse<unknown, unknown>;
      userProvider.user = user;
      userProvider.token = pb.authStore.token;
      userProvider.subscribe(user.id);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      userProvider.user = null;
    }
  } else {
    userProvider.unsubscribe();
    userProvider.user = null;
    userProvider.token = null;
    settingsProvider.clear();
    uiProvider.clear();
  }
}, false);
