import { logger } from "@/shared/lib/logger";
import { pb } from "@/shared/lib/pb";
import type { SubscriptionsResponse } from "@/shared/models/pocketbase-types";
import { saveRoomCharge } from "@/analytics/save-room-charge";

import { BILLING_ERRORS } from "./errors";
import { BILLING_LIMITS } from "./config";

const log = logger.child({
  module: "billing",
});

export async function chargeRoom(roomId: string) {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "chat,chat.integration,chat.project,chat.project.org,chat.project.org.subscription",
  });
  const sub: SubscriptionsResponse = (room.expand as any)?.chat?.expand?.project
    ?.expand?.org.expand?.subscription;

  if (!sub) {
    log.error({ roomId }, "Subscription has not been found");
    throw new Error(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND);
  }

  if (sub.thaliaGas >= BILLING_LIMITS[sub.tier]) {
    log.error({ roomId }, "Thalia gas exceeded");
    throw new Error(BILLING_ERRORS.THALIA_GAS_EXCEEDED);
  }

  await pb.collection("subscriptions").update(sub.id, {
    thaliaGas: sub.thaliaGas + 1,
  });
  await saveRoomCharge(roomId);
}
