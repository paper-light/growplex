import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";

class SubscriptionProvider {
  private subscribed = false;

  subscription = $state<SubscriptionsResponse | null>(null);

  async load(orgId: string) {
    const subscription = await pb
      .collection("subscriptions")
      .getFirstListItem(`orgs_via_subscription.id = "${orgId}"`);
    this.subscription = subscription;
    return subscription;
  }

  async subscribe(orgId: string) {
    if (this.subscribed) return;

    this.subscribed = true;
    const sub = await this.load(orgId);

    pb.collection("subscriptions").subscribe(sub.id, (e) => {
      if (e.action === "update") {
        this.subscription = e.record;
      }
    });
  }

  unsubscribe() {
    if (!this.subscribed) return;

    this.subscribed = false;
    pb.collection("subscriptions").unsubscribe(this.subscription?.id);
    this.subscription = null;
  }
}

export const subscriptionProvider = new SubscriptionProvider();
