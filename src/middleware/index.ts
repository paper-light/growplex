import { defineMiddleware } from "astro:middleware";
import { paraglideMiddleware } from "../shared/paraglide/server.js";
import { ensureAdmin } from "../auth";

export const onRequest = defineMiddleware(async (context, next) => {
  if (
    context.url.pathname.startsWith("/app") ||
    context.url.pathname.startsWith("/api") ||
    context.url.pathname.startsWith("/embed") ||
    context.url.pathname.startsWith("/_actions")
  ) {
    try {
      await ensureAdmin();
    } catch (err) {
      console.error("[pbAdminMiddleware] Failed to authenticate:", err);
      return new Response("Unauthorized, please contact support", {
        status: 401,
      });
    }
  }

  if (
    context.url.pathname.startsWith("/api") ||
    context.url.pathname.startsWith("/_actions")
  ) {
    return next();
  }

  return paraglideMiddleware(context.request, () => next());
});
