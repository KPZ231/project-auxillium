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

    const cacheKey = `leads:${userId}`

    if (!forceRefresh) {
      const cachedLeads = await getCachedData<any[]>(cacheKey)
      if (cachedLeads) {
        return { success: true, data: cachedLeads, fromCache: true }
      }
    }

    const leads = await prisma.lead.findMany({
      where: { userId },
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

export async function forceRefreshLeads() {
  const { userId } = await getUser()
  if (userId) {
    await invalidateCache(`leads:${userId}`)
  }
}
