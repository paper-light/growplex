import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import type {
  SubscriptionsResponse,
  TiersResponse,
} from "@/shared/models/pocketbase-types";
import { saveRoomCharge } from "@/analytics/save-room-charge";

import { BILLING_ERRORS } from "./errors";

const log = logger.child({
  module: "billing",
});

export async function chargeRoom(roomId: string) {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "chat,chat.integration,chat.project,chat.project.org,chat.project.org.subscription,chat.project.org.subscription.tier",
  });
  const sub: SubscriptionsResponse = (room.expand as any)?.chat?.expand?.project
    ?.expand?.org.expand?.subscription;
  const tier: TiersResponse = (sub.expand as any)?.tier;

  if (!tier || !sub) {
    log.error({ roomId }, "Tier or subscription not found");
    throw new Error(BILLING_ERRORS.TIER_NOT_FOUND);
  }

  if (sub.thaliaGas >= tier.thaliaCap) {
    log.error({ roomId }, "Thalia gas exceeded");
    throw new Error(BILLING_ERRORS.THALIA_GAS_EXCEEDED);
  }

  await pb.collection("subscriptions").update(sub.id, {
    thaliaGas: sub.thaliaGas + 1,
  });
  await saveRoomCharge(roomId);
}
