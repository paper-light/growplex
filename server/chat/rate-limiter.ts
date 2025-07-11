import { getEnv } from "@/shared/helpers/get-env";
import { createRateLimiter } from "@/shared/helpers/rate-limite";

const DURATION = parseInt(getEnv("PUBLIC_MESSAGE_DELAY_SEC"));

export const chatRateLimiter = createRateLimiter({
  keyPrefix: "socket_chat_rl",
  points: 1,
  duration: DURATION,
});
