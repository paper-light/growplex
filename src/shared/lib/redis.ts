import Redis from "ioredis";

import { getEnv } from "../helpers/get-env";

const REDIS_URL = getEnv("REDIS_URL");

export const redisClient = new Redis(REDIS_URL);
