import { defineMiddleware } from "astro:middleware";
import { pb } from "../server/config/pb";
import { getEnv } from "../helpers/get-env";

const PB_ID = getEnv("PB_ID");
const PB_PASSWORD = getEnv("PB_PASSWORD");

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    console.log("HELLO")
    if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
      const authData = await pb
        .collection("_superusers")
        .authWithPassword(PB_ID, PB_PASSWORD);

      pb.authStore.save(authData.token, authData.record);
    }
    return next();
  } catch (err) {
    console.error("[pbAdminMiddleware] Failed to authenticate:", err);
    return new Response();
  }
});
