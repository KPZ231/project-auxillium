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

// Rate limiter for lead search API
export const leadSearchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 searches per hour
  analytics: true,
  prefix: "ratelimit:leadsearch",
});

// Rate limiter for AI chat (PRO users)
export const aiProRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(25, "1 h"), // 25 prompts per hour
  analytics: true,
  prefix: "ratelimit:ai:pro",
});

// Rate limiter for Admin auth
export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
  prefix: "ratelimit:admin",
});

export async function checkRateLimit(identifier: string, type: "auth" | "email" | "leadsearch" | "ai" | "admin" = "auth") {
  let limiter = authRateLimit;
  if (type === "email") limiter = emailRateLimit;
  if (type === "leadsearch") limiter = leadSearchRateLimit;
  if (type === "ai") limiter = aiProRateLimit;
  if (type === "admin") limiter = adminRateLimit;

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
