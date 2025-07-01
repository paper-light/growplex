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

  private subscriptionId: string | null = null;

  constructor() {
    pb.authStore.onChange((token, rec) => {
      if (rec && pb.authStore.isValid) {
        try {
          this.user = UserSchema.parse(rec);
          settingsProvider.mergeUser(this.user);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          this.user = null;
        }
      } else {
        this.user = null;
        settingsProvider.clear();
      }
    });
  }

  async subscribeUser() {
    if (!pb.authStore.isValid) {
      console.log("No user to subscribe to");
      return;
    }

    try {
      await this.refreshUser();

      this.subscriptionId = pb.authStore.record!.id;
      await pb.collection("users").subscribe(
        this.subscriptionId,
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
    } catch (error) {
      console.error("Failed to subscribe to user:", error);
    }
  }

  async unsubscribeUser() {
    if (!this.subscriptionId) {
      console.log("No active subscription to unsubscribe from");
      return;
    }

    try {
      console.log("Unsubscribing from user: ", this.subscriptionId);
      await pb.collection("users").unsubscribe(this.subscriptionId);
      this.subscriptionId = null;
    } catch (error) {
      console.error("Failed to unsubscribe from user:", error);
    }
  }

  async refreshUser() {
    try {
      const authResponse = await pb.collection("users").authRefresh({
        expand: this.expandString,
      });
      pb.authStore.save(authResponse.token, authResponse.record);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, clear auth state
      pb.authStore.clear();
    }
  }

  logout() {
    this.unsubscribeUser();
    pb.authStore.clear();
    settingsProvider.clear();
  }
}

export const authProvider = new AuthProvider();
