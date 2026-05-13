"use server";

import { checkRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";

const API_BASE = "https://scraper-bdxt.onrender.com";

export async function startLeadSearch(query: string, limit: number) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Only check rate limit if UPSTASH is configured
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const { success: rateSuccess } = await checkRateLimit(session.userId, "leadsearch");
        if (!rateSuccess) {
          return { success: false, error: "rate_limit_error" };
        }
      } catch (err) {
        console.warn("[RateLimit Error] Skipping rate limit check", err);
      }
    }

    const response = await fetch(`${API_BASE}/api/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, headless: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start job: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("[startLeadSearch Error]", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function getLeadSearchJob(jobId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const CACHE_KEY = `leadsearch:job:${jobId}`;
    
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const cachedData = await getCachedData(CACHE_KEY);
        if (cachedData) {
          return { success: true, data: cachedData };
        }
      } catch (err) {
        console.warn("[Redis Error] Skipping cache read", err);
      }
    }

    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return { success: false, error: "not_found" };
      throw new Error("Failed to fetch job");
    }

    const data = await response.json();
    
    if (process.env.UPSTASH_REDIS_REST_URL && (data.status === "done" || data.status === "error")) {
      try {
        await setCachedData(CACHE_KEY, data, 3600); // Cache for 1 hour
      } catch (err) {
        console.warn("[Redis Error] Skipping cache write", err);
      }
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("[getLeadSearchJob Error]", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function deleteLeadSearchJob(jobId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      throw new Error("Failed to delete job");
    }

    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const CACHE_KEY = `leadsearch:job:${jobId}`;
        await invalidateCache(CACHE_KEY);
      } catch (err) {
        console.warn("[Redis Error] Skipping cache invalidation", err);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("[deleteLeadSearchJob Error]", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
