import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General rate limiter (e.g. for login attempts)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 attempts per 10 minutes
  analytics: true,
  prefix: "ratelimit:auth",
});

// Rate limiter for password reset emails
export const emailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 emails per hour
  analytics: true,
  prefix: "ratelimit:email",
});

export async function checkRateLimit(identifier: string, type: "auth" | "email" = "auth") {
  const limiter = type === "auth" ? authRateLimit : emailRateLimit;
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset,
  };
}
