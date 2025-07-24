import type { AuthRecord } from "pocketbase";
import { pb } from "../shared/lib/pb";
import type {
  OrgMembersResponse,
  OrgsResponse,
  UsersResponse,
} from "../shared/models/pocketbase-types";

import { settingsProvider } from "./settings.svelte";
class UserProvider {
  // STATE
  private subscribed = false;

  user = $state<UsersResponse<unknown, unknown> | null>(
    pb.authStore.isValid
      ? (pb.authStore.record as UsersResponse<unknown, unknown>)
      : null
  );
  token = $state<string | null>(null);

  orgMembers: OrgMembersResponse[] = $derived(
    (this.user?.expand as any)?.orgMembers || []
  );
  orgs: OrgsResponse[] = $derived(
    this.orgMembers?.map((o) => (o.expand as any).org) || []
  );

  selectedOrg = $derived.by(() => {
    if (this.orgs.length == 0) return null;
    if (settingsProvider.selectedOrgId) {
      const found = this.orgs.find(
        (o) => o && o.id === settingsProvider.selectedOrgId
      );
      if (found) return found;
    }
    return this.orgs[0];
  });
  currentRole = $derived.by(() => {
    if (!this.selectedOrg) return null;
    const mem = this.orgMembers.find((m) => m.org === this.selectedOrg!.id);
    return mem?.role;
  });

  // SUBSCRIPTIONS
  async load() {
    const data = await pb.collection("users").authRefresh({
      expand: "orgMembers,orgMembers.org",
    });
    if (!data) return;
    pb.authStore.save(data.token, data.record as AuthRecord);
    return data.record;
  }

  async subscribe(userId: string) {
    if (this.subscribed || !userId) return;
    this.subscribed = true;

    await this.load();

    pb.collection("users").subscribe(
      userId,
      (e) => {
        switch (e.action) {
          case "update":
            pb.authStore.save(pb.authStore.token, e.record as AuthRecord);
            break;
          case "delete":
            pb.authStore.clear();
            break;
        }
      },
      {
        expand: "orgMembers,orgMembers.org",
      }
    );
  }

  unsubscribe() {
    if (!this.subscribed) return;
    this.subscribed = false;
    pb.collection("users").unsubscribe(this.user!.id);
  }
}

export const userProvider = new UserProvider();
