import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";
import { BILLING_GAS_PRICES_PER_TOKEN } from "./config";
import { BILLING_ERRORS } from "./errors";

type Model = "gpt-5-nano" | "gpt-5-mini" | "text-embedding-3-small";

class Charger {
  async validateRoom(roomId: string) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    if (sub.tier !== "PAYG" && new Date(sub.ended).getTime() < Date.now())
      throw new Error(BILLING_ERRORS.SUBSCRIPTION_EXPIRED);

    if (sub.gas <= 0) throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

    return sub;
  }

  async charge(
    subId: string,
    tokens: number,
    type: "cache" | "in" | "out",
    model: Model
  ) {
    const price = BILLING_GAS_PRICES_PER_TOKEN[model][type] * tokens;

    const sub = await pb.collection("subscriptions").getOne(subId);

    await pb.collection("subscriptions").update(sub.id, {
      gas: sub.gas - price,
    });
  }

  private async getSubscriptionFromRoom(roomId: string) {
    const room = await pb.collection("rooms").getOne(roomId, {
      expand:
        "chat,chat.project,chat.project.org,chat.project.org.subscription",
    });
    const sub: SubscriptionsResponse = (room.expand as any)?.chat?.expand
      ?.project?.expand?.org.expand?.subscription;

    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    return sub;
  }

  private async getSubscriptionFromOrg(orgId: string) {
    const org = await pb.collection("orgs").getOne(orgId, {
      expand: "subscription",
    });
    const sub: SubscriptionsResponse = (org.expand as any).subscription;
    return sub;
  }
}

export const charger = new Charger();
