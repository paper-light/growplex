import AuthResponse from "pocketbase";
import { defineMiddleware } from "astro:middleware";
import { pb } from "../shared/pb";
import { getEnv } from "../shared/helpers/get-env";

const PB_ID = getEnv("PB_ID");
const PB_PASSWORD = getEnv("PB_PASSWORD");

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
      const authData = await pb
        .collection("_superusers")
        .authWithPassword(PB_ID, PB_PASSWORD, { requestKey: null });

      pb.authStore.save(authData.token, authData.record as AuthResponse);
    }
    return next();
  } catch (err) {
    console.error("[pbAdminMiddleware] Failed to authenticate:", err);
    return new Response();
  }
});
