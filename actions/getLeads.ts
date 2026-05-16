'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session"
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis"

export const getLeads = async (forceRefresh: boolean = false) => {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized", data: [] }
    }

    const { getActiveSpaceId } = await import("./space");
    const spaceId = await getActiveSpaceId();
    
    const cacheKey = `leads:${userId}${spaceId ? `:${spaceId}` : ""}`

    if (!forceRefresh) {
      const cachedLeads = await getCachedData<unknown[]>(cacheKey)
      if (cachedLeads) {
        return { success: true, data: cachedLeads, fromCache: true }
      }
    }

    const leads = await prisma.lead.findMany({
      where: { 
        userId,
        ...(spaceId ? { spaceId } : {})
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    // Cache for 5 minutes (300 seconds)
    await setCachedData(cacheKey, leads, 300)

    return { success: true, data: leads, fromCache: false }
  } catch (error) {
    console.error("Failed to fetch leads:", error)
    return { success: false, error: "Failed to fetch leads", data: [] }
  }
}

export const refreshLeads = async () => {
  const { userId } = await getUser();
  const { getActiveSpaceId } = await import("./space");
  const spaceId = await getActiveSpaceId();
  if (userId) {
    await invalidateCache(`leads:${userId}${spaceId ? `:${spaceId}` : ""}`)
  }
}
