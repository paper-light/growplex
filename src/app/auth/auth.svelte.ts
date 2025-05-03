import { z } from "zod";
import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase, { AsyncAuthStore } from "pocketbase";

import { UserSchema } from "./models";

const store = new AsyncAuthStore({
  save: async (serialized: string) => {
    localStorage.setItem("pb_auth", serialized);
  },
  initial: localStorage.getItem("pb_auth") ?? "",
  clear: async () => {
    localStorage.removeItem("pb_auth");
  },
});

class AuthProvider {
  pb = new PocketBase(PUBLIC_PB_URL, store);
  user: z.infer<typeof UserSchema> | null = $derived(
    this.pb.authStore.record && this.pb.authStore.isValid
      ? UserSchema.parse(this.pb.authStore.record)
      : null
  );

  async subscribeUser() {
    if (!this.user) {
      console.log("No user to subscribe to");
      return;
    }

    await this.refreshUser();

    await this.pb.collection("users").subscribe(this.user.id, async (e) => {
      switch (e.action) {
        case "update": {
          this.pb.authStore.save(this.pb.authStore.token, e.record);
          break;
        }
        case "delete": {
          this.pb.authStore.clear();
          break;
        }
        default:
          console.log("Ignore action: ", e.action);
      }
    });
  }

  async unsubscribeUser() {
    if (!this.user) {
      console.log("No user to unsubscribe from");
      return;
    }
    console.log("Unsubscribing from user: ", this.user.id);
    await this.pb.collection("users").unsubscribe(this.user.id);
    this.pb.authStore.clear();
  }

  async refreshUser() {
    const authResponse = await this.pb.collection("users").authRefresh();
    this.pb.authStore.save(authResponse.token, authResponse.record);
  }
}

export const authProvider = new AuthProvider();
