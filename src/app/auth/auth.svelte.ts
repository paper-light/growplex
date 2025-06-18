import { z } from "zod";
import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase, { AsyncAuthStore } from "pocketbase";

import { UserSchema } from "../../models";
import { settingsProvider } from "../settings/settings.svelte";

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    localStorage.setItem("pb_auth", serialized);
  },
  initial: localStorage.getItem("pb_auth") ?? "",
  clear: async () => {
    localStorage.removeItem("pb_auth");
  },
});

export const pb = new PocketBase(PUBLIC_PB_URL, store);

class AuthProvider {
  expandKeys = [
    "orgMembers",
    "orgMembers.org",
    "orgMembers.org.projects",
    "orgMembers.org.projects.integrations",
    "orgMembers.org.projects.agents",
    "orgMembers.org.projects.knowledgeSources",
    "orgMembers.org.projects.chats",

    "orgMembers.org.projects.integrations.agent",
    "orgMembers.org.projects.integrations.knowledgeSources",
    "orgMembers.org.projects.integrations.chat",
  ] as const;

  expandString = this.expandKeys.join(",");

  user = $state<z.infer<typeof UserSchema> | null>(
    pb.authStore.isValid ? UserSchema.parse(pb.authStore.record!) : null
  );

  constructor() {
    pb.authStore.onChange((token, rec) => {
      if (rec && pb.authStore.isValid) {
        this.user = UserSchema.parse(rec);
        settingsProvider.mergeUser(this.user);
      } else {
        this.user = null;
      }
    });
  }

  async subscribeUser() {
    if (!pb.authStore.isValid) {
      console.log("No user to subscribe to");
      return;
    }

    await this.refreshUser();

    await pb.collection("users").subscribe(
      pb.authStore.record!.id,
      async (e) => {
        switch (e.action) {
          case "update": {
            pb.authStore.save(pb.authStore.token, e.record);
            break;
          }
          case "delete": {
            pb.authStore.clear();
            break;
          }
          default: {
            console.log("Ignore action: ", e.action);
          }
        }
      },
      { expand: this.expandString }
    );
  }

  async unsubscribeUser() {
    if (!this.user) {
      console.log("No user to unsubscribe from");
      return;
    }
    console.log("Unsubscribing from user: ", this.user.id);
    await pb.collection("users").unsubscribe(this.user.id);
    this.logout();
  }

  async refreshUser() {
    const authResponse = await pb.collection("users").authRefresh({
      expand: this.expandString,
    });
    pb.authStore.save(authResponse.token, authResponse.record);
  }

  logout() {
    pb.authStore.clear();
    settingsProvider.clear();
  }
}

export const authProvider = new AuthProvider();
