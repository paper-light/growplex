import { pb } from "../shared/lib/pb";
import type { UserExpand } from "../shared/models/expands";
import type { UsersResponse } from "../shared/models/pocketbase-types";

class AuthProvider {
  expandKeys = [
    "orgMembers",
    "orgMembers.org",
    "orgMembers.org.projects",
    "orgMembers.org.projects.integrations",
    "orgMembers.org.projects.agents",
    "orgMembers.org.projects.sources",
    "orgMembers.org.projects.chats",

    "orgMembers.org.projects.integrations.agent",
    "orgMembers.org.projects.integrations.sources",
    "orgMembers.org.projects.integrations.chat",
    "orgMembers.org.projects.integrations.operators",
  ] as const;
  expandString = this.expandKeys.join(",");

  user = $state<UsersResponse<unknown, UserExpand> | null>(
    pb.authStore.isValid
      ? (pb.authStore.record as UsersResponse<unknown, UserExpand>)
      : null
  );
  token = $state(pb.authStore.token);

  orgMembers = $derived(this.user?.expand?.orgMembers || []);
  orgs = $derived(this.orgMembers.map((m) => m.expand!.org!));

  private subscriptionId: string | null = null;

  setUser(user: UsersResponse<unknown, UserExpand> | null) {
    this.user = user;
  }
  setToken(token: string) {
    this.token = token;
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
              pb.authStore.save(
                pb.authStore.token,
                e.record as UsersResponse<unknown, UserExpand>
              );
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
      pb.authStore.save(
        authResponse.token,
        authResponse.record as UsersResponse<void, UserExpand>
      );
    } catch (error) {
      console.error("Failed to refresh user:", error);
      pb.authStore.clear();
    }
  }

  logout() {
    pb.authStore.clear();
  }
}

export const authProvider = new AuthProvider();
