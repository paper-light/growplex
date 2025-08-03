import { createRateLimiter } from "@/shared/helpers/rate-limite";
import { CHAT_CONFIG } from "@/chat/config";

const DURATION = CHAT_CONFIG.MESSAGE_DELAY_SEC * 1000;

export const chatRateLimiter = createRateLimiter({
  keyPrefix: "socket_chat_rl",
  points: 1,
  durationSeconds: DURATION,
});
