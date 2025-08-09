import { z } from "zod";
import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

import { BILLING_GAS_PRICES_PER_TOKEN } from "./config";
import { BILLING_ERRORS } from "./errors";

const log = logger.child({
  module: "billing:charger",
});

export type Model = "gpt-5-nano" | "gpt-5-mini" | "text-embedding-3-small";

export const UsageSchema = z
  .object({
    "gpt-5-nano": z
      .object({
        cache: z.number().default(0),
        in: z.number().default(0),
        out: z.number().default(0),
      })
      .default({ cache: 0, in: 0, out: 0 }),
    "gpt-5-mini": z
      .object({
        cache: z.number().default(0),
        in: z.number().default(0),
        out: z.number().default(0),
      })
      .default({ cache: 0, in: 0, out: 0 }),
    "text-embedding-3-small": z
      .object({
        cache: z.number().default(0),
        in: z.number().default(0),
        out: z.number().default(0),
      })
      .default({ cache: 0, in: 0, out: 0 }),
  })
  .partial()
  .transform((data) => {
    const defaultUsage = {
      "gpt-5-nano": { cache: 0, in: 0, out: 0 },
      "gpt-5-mini": { cache: 0, in: 0, out: 0 },
      "text-embedding-3-small": { cache: 0, in: 0, out: 0 },
    };
    return { ...defaultUsage, ...data };
  });
export type Usage = z.infer<typeof UsageSchema>;

class Charger {
  async validateRoom(roomId: string) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    if (!sub) throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);

    if (sub.tier !== "PAYG" && new Date(sub.ended).getTime() < Date.now())
      throw new Error(BILLING_ERRORS.SUBSCRIPTION_EXPIRED);

    if (sub.gas <= 0) throw new Error(BILLING_ERRORS.NOT_ENOUGH_GAS);

    return sub;
  }

  async chargePrice(roomId: string, price: number) {
    if (price <= 0) return;

    const sub = await this.getSubscriptionFromRoom(roomId);
    await pb.collection("subscriptions").update(sub.id, {
      gas: sub.gas - price,
    });
  }

  async chargeUsage(roomId: string, usage: Usage) {
    const sub = await this.getSubscriptionFromRoom(roomId);
    log.debug({ usage }, "charging model");

    await Promise.all([
      // NANO
      this.charge(sub.id, usage["gpt-5-nano"].cache, "cache", "gpt-5-nano"),
      this.charge(sub.id, usage["gpt-5-nano"].in, "in", "gpt-5-nano"),
      this.charge(sub.id, usage["gpt-5-nano"].out, "out", "gpt-5-nano"),
      // MINI
      this.charge(sub.id, usage["gpt-5-mini"].cache, "cache", "gpt-5-mini"),
      this.charge(sub.id, usage["gpt-5-mini"].in, "in", "gpt-5-mini"),
      this.charge(sub.id, usage["gpt-5-mini"].out, "out", "gpt-5-mini"),
      // EMBEDDING
      this.charge(
        sub.id,
        usage["text-embedding-3-small"].in,
        "in",
        "text-embedding-3-small"
      ),
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

// Test the schema behavior:
// const usage = UsageSchema.parse({});
// console.log(usage);
// Output: {
//   "gpt-5-nano": { cache: 0, in: 0, out: 0 },
//   "gpt-5-mini": { cache: 0, in: 0, out: 0 },
//   "text-embedding-3-small": { cache: 0, in: 0, out: 0 }
// }
