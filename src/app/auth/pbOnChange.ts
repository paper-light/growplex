import { authProvider } from "./auth.svelte";
import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../settings/settings.svelte";
import type { UsersResponse } from "../../shared/models/pocketbase-types";
import type { UserExpand } from "../../shared/models/expands";

pb.authStore.onChange((token, rec) => {
  if (rec && pb.authStore.isValid) {
    try {
      const user = rec as UsersResponse<unknown, UserExpand>;
      authProvider.setUser(user);
      authProvider.setToken(token);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      authProvider.setUser(null);
    }
  } else {
    authProvider.setUser(null);
    authProvider.setToken("");
    authProvider.unsubscribeUser();
    settingsProvider.clear();
  }
}, false);
