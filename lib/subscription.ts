import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Plan = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  spaces: number;
  projects: number;
  clients: number;
  leads: number;
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
 * Pure — no I/O.
 */
export function getPlanFromUser(user: {
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}): Plan {
  const now = new Date();

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
      return {
        spaces: Infinity,
        projects: Infinity,
        clients: Infinity,
        leads: Infinity,
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
    default:
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
    default:
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

  // Try cache first — getCachedData already swallows Redis errors and returns null
  const cached = await getCachedData<{
    plan: Plan;
    limits: PlanLimits;
    features: PlanFeatures;
  }>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  // Cache miss — query DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripePriceId: true, stripeCurrentPeriodEnd: true },
  });

  const plan = user
    ? getPlanFromUser(user)
    : "FREE";

  const result = {
    plan,
    limits: getPlanLimits(plan),
    features: getPlanFeatures(plan),
  };

  // Populate cache — setCachedData already swallows Redis errors
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
