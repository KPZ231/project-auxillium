import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  spaces: number | null;
  projects: number | null;
  clients: number | null;
  leads: number | null;
  aiPromptsPerHour: number | null; // null = unlimited
}

export interface PlanFeatures {
  ai: boolean;
  search: boolean;
  googleConnectors: boolean;
  documentGenerator: boolean;
  financialControl: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STRIPE_PRICE_IDS = {
  PRO: "price_1Taey5EBFAZLdzO9LlYWpLIj",
  ENTERPRISE: "price_1Taey4EBFAZLdzO9Rkn8Jy6Z",
} as const;

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/**
 * Derives the user's plan from their Stripe subscription fields.
 * Pure  no I/O.
 */
export function getPlanFromUser(
  user: { stripePriceId: string | null; stripeCurrentPeriodEnd: Date | null },
  now: Date = new Date()
): Plan {
  if (
    user.stripePriceId === STRIPE_PRICE_IDS.ENTERPRISE &&
    user.stripeCurrentPeriodEnd !== null &&
    user.stripeCurrentPeriodEnd > now
  ) {
    return "ENTERPRISE";
  }

  if (
    user.stripePriceId === STRIPE_PRICE_IDS.PRO &&
    user.stripeCurrentPeriodEnd !== null &&
    user.stripeCurrentPeriodEnd > now
  ) {
    return "PRO";
  }

  return "FREE";
}

/**
 * Returns resource limits for the given plan.
 */
export function getPlanLimits(plan: Plan): PlanLimits {
  switch (plan) {
    case "ENTERPRISE":
      // null means unlimited. Usage checks must guard: `limits.X !== null && count >= limits.X`
      return {
        spaces: null,
        projects: null,
        clients: null,
        leads: null,
        aiPromptsPerHour: null,
      };
    case "PRO":
      return {
        spaces: 3,
        projects: 25,
        clients: 40,
        leads: 120,
        aiPromptsPerHour: 25,
      };
    case "FREE":
      return {
        spaces: 1,
        projects: 5,
        clients: 10,
        leads: 15,
        aiPromptsPerHour: 0,
      };
  }
}

/**
 * Returns feature flags for the given plan.
 */
export function getPlanFeatures(plan: Plan): PlanFeatures {
  switch (plan) {
    case "ENTERPRISE":
    case "PRO":
      return {
        ai: true,
        search: true,
        googleConnectors: true,
        documentGenerator: true,
        financialControl: true,
      };
    case "FREE":
      return {
        ai: false,
        search: false,
        googleConnectors: false,
        documentGenerator: false,
        financialControl: true,
      };
  }
}

// ---------------------------------------------------------------------------
// Async helpers
// ---------------------------------------------------------------------------

const USER_PLAN_TTL = 300; // 5 minutes

/**
 * Fetches a user's plan, limits, and features.
 * Checks Redis cache first (key: `user:plan:{userId}`, TTL 300 s).
 * Falls back to Prisma on cache miss. Redis errors are swallowed silently.
 */
export async function getUserPlanById(userId: string): Promise<{
  plan: Plan;
  limits: PlanLimits;
  features: PlanFeatures;
}> {
  const cacheKey = `user:plan:${userId}`;

  // Try cache first  getCachedData already swallows Redis errors and returns null
  const cached = await getCachedData<{
    plan: Plan;
    limits: PlanLimits;
    features: PlanFeatures;
  }>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  // Cache miss  query DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripePriceId: true, stripeCurrentPeriodEnd: true },
  });

  // If user is null (transient DB error or unknown userId), return FREE without
  // caching  we don't want to persist a stale FREE entry in Redis.
  if (!user) {
    return {
      plan: "FREE",
      limits: getPlanLimits("FREE"),
      features: getPlanFeatures("FREE"),
    };
  }

  const plan = getPlanFromUser(user);

  const result = {
    plan,
    limits: getPlanLimits(plan),
    features: getPlanFeatures(plan),
  };

  // Populate cache  setCachedData already swallows Redis errors
  await setCachedData(cacheKey, result, USER_PLAN_TTL);

  return result;
}

/**
 * Invalidates the Redis cache entry for a user's plan.
 * Errors are swallowed silently.
 */
export async function invalidateUserPlanCache(userId: string): Promise<void> {
  await invalidateCache(`user:plan:${userId}`);
}
