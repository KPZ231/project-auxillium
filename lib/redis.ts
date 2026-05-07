import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;

/**
 * Cache utility functions
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.error(`[REDIS_GET_ERROR] Key: ${key}`, error);
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error(`[REDIS_SET_ERROR] Key: ${key}`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[REDIS_DEL_ERROR] Key: ${key}`, error);
  }
}
