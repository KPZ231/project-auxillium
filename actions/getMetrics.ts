'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session"

export async function getProjectCount() {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return { success: false, error: "Unauthorized" }

    const count = await prisma.project.count({
      where: { userId }
    })
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch project count:", error)
    return { success: false, error: "Failed to fetch project count" }
  }
}

export async function getCriticalPriotiryCount(){
   try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return { success: false, error: "Unauthorized" }

    const count = await prisma.project.count({
      where: {
        priority: "Critical",
        userId,
      },
    })
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch critical priority count:", error)
    return { success: false, error: "Failed to fetch critical priority count" }
  }
}
