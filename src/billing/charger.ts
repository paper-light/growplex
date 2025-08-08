import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

import { BILLING_GAS_PRICES_PER_TOKEN } from "./config";
import { BILLING_ERRORS } from "./errors";

const log = logger.child({
  module: "billing:charger",
});

type Model = "gpt-5-nano" | "gpt-5-mini" | "text-embedding-3-small";

export interface ModelUsage {
  model: Model;
  tokens: {
    cache: number;
    in: number;
    out: number;
  };
}

class Charger {
  async validateRoom(roomId: string) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    if (sub.tier !== "PAYG" && new Date(sub.ended).getTime() < Date.now())
      throw new Error(BILLING_ERRORS.SUBSCRIPTION_EXPIRED);

    if (sub.gas <= 0) throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

    return sub;
  }

  async chargeModel(roomId: string, usage: ModelUsage) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    log.debug({ usage }, "charging model");

    await Promise.all([
      this.charge(sub.id, usage.tokens.cache, "cache", usage.model),
      this.charge(sub.id, usage.tokens.in, "in", usage.model),
      this.charge(sub.id, usage.tokens.out, "out", usage.model),
    ]);
  }

  async charge(
    subId: string,
    tokens: number,
    type: "cache" | "in" | "out",
    model: Model
  ) {
    if (tokens === 0) return;

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
}

export const charger = new Charger();
