import { defineMiddleware } from "astro:middleware";
import { pb } from "../shared/lib/pb";
import { getEnv } from "../shared/helpers/get-env";
import type { AuthRecord } from "pocketbase";

import { paraglideMiddleware } from "../shared/paraglide/server.js";

const PB_ID = getEnv("PB_ID");
const PB_PASSWORD = getEnv("PB_PASSWORD");

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/app")) {
    try {
      if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
        const authData = await pb
          .collection("_superusers")
          .authWithPassword(PB_ID, PB_PASSWORD, { requestKey: null });

        pb.authStore.save(authData.token, authData.record as AuthRecord);
      }
    } catch (err) {
      console.error("[pbAdminMiddleware] Failed to authenticate:", err);
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (context.url.pathname.startsWith("/api")) {
    return next();
  }

  return paraglideMiddleware(context.request, () => next());
});
