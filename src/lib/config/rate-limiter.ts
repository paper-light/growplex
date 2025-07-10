import { RateLimiterRedis } from "rate-limiter-flexible";

import { getEnv } from "../../shared/helpers/get-env";

import { redisClient } from "./redis";

const DURATION = parseInt(getEnv("PUBLIC_MESSAGE_DELAY_SEC"));

export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "socket_chat_rl",
  points: 1,
  duration: DURATION,
});
