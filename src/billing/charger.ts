import { z } from "zod";
import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

import { BILLING_GAS_PRICES_PER_TOKEN } from "./config";
import { BILLING_ERRORS } from "./errors";
import type { Model } from "./types";

const log = logger.child({
  module: "billing:charger",
});

class Charger {
  async validateProject(projectId: string) {
    const sub = await this.getSubscriptionFromProject(projectId);
    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    if (sub.tier !== "PAYG" && new Date(sub.ended).getTime() < Date.now())
      throw new Error(BILLING_ERRORS.SUBSCRIPTION_EXPIRED);

    if (sub.gas <= 0) throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

    return sub;
  }

  async validateRoom(roomId: string) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    if (sub.tier !== "PAYG" && new Date(sub.ended).getTime() < Date.now())
      throw new Error(BILLING_ERRORS.SUBSCRIPTION_EXPIRED);

    if (sub.gas <= 0) throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

    return sub;
  }

  async chargePrice(subId: string, price: number) {
    if (price <= 0) return;

    const sub = await pb.collection("subscriptions").getOne(subId);
    await pb.collection("subscriptions").update(sub.id, {
      gas: sub.gas - price,
    });
  }

  async chargeModel(
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

  private async getSubscriptionFromProject(projectId: string) {
    const project = await pb.collection("projects").getOne(projectId, {
      expand: "org,org.subscription",
    });
    const sub: SubscriptionsResponse = (project.expand as any)?.org.expand
      ?.subscription;
    return sub;
  }
}

export const charger = new Charger();
