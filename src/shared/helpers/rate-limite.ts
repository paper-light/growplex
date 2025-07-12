import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "../../lib/config/redis";

export interface RateLimiterConfig {
  keyPrefix: string;
  points: number;
  durationSeconds: number;
}

export interface RateLimitOptions {
  waitOnLimit?: boolean;
  maxWaitTime?: number;
  fallbackDelay?: number;
}

export function createRateLimiter(config: RateLimiterConfig): RateLimiterRedis {
  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: config.keyPrefix,
    points: config.points,
    duration: config.durationSeconds,
  });
}

export async function rateLimitWait(
  limiter: RateLimiterRedis,
  key: string,
  points: number = 1,
  maxWaitTime: number = 10000
): Promise<void> {
  return rateLimit(limiter, key, points, {
    waitOnLimit: true,
    maxWaitTime,
  });
}

export async function rateLimitThrow(
  limiter: RateLimiterRedis,
  key: string,
  points: number = 1
): Promise<void> {
  return rateLimit(limiter, key, points, {
    waitOnLimit: false,
  });
}

async function rateLimit(
  limiter: RateLimiterRedis,
  key: string,
  points: number = 1,
  options: RateLimitOptions = {}
): Promise<void> {
  const {
    waitOnLimit = false,
    maxWaitTime = 10 * 1000,
    fallbackDelay = 1 * 1000,
  } = options;

  try {
    await limiter.consume(key, points);
  } catch (error) {
    if (!waitOnLimit) {
      throw error;
    }

    if (error && typeof error === "object" && "msBeforeNext" in error) {
      const msBeforeNext = (error as any).msBeforeNext || fallbackDelay;

      const waitTime = Math.min(msBeforeNext, maxWaitTime);

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } else {
      await new Promise((resolve) => setTimeout(resolve, fallbackDelay));
    }
  }
}
