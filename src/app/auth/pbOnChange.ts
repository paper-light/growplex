import { UserSchema } from "../../models";
import { authProvider } from "./auth.svelte";
import { pb } from "./pb";
import { settingsProvider } from "../settings/settings.svelte";

pb.authStore.onChange((token, rec) => {
  if (rec && pb.authStore.isValid) {
    try {
      const user = UserSchema.parse(rec);
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
