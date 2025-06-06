import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redisClient } from "./redis";

export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "socket_chat_rl",
  points: 1, // 1 message
  duration: 2, // per 2 seconds
});
