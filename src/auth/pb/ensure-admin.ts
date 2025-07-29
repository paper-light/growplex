import type { AuthRecord } from "pocketbase";

import { pb } from "@/shared/lib/pb";
import { getEnv } from "@/shared/helpers/get-env";

const PB_ID = getEnv("PB_ID");
const PB_PASSWORD = getEnv("PB_PASSWORD");

// -------------------------PUBLIC-------------------------

export async function ensureAdmin() {
  if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
    const authData = await pb
      .collection("_superusers")
      .authWithPassword(PB_ID, PB_PASSWORD);

    pb.authStore.save(authData.token, authData.record as AuthRecord);
  }
}
