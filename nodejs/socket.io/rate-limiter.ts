import { createRateLimiter } from "@/shared/helpers/rate-limite";
import { CHAT_CONFIG } from "@/chat/config";

export const chatRateLimiter = createRateLimiter({
  keyPrefix: "socket_chat_rl",
  points: 1,
  durationSeconds: CHAT_CONFIG.MESSAGE_DELAY_SEC,
});
