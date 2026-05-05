'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session"
import { invalidateCache } from "@/lib/redis"
import { revalidatePath } from "next/cache"

export async function reorderLeads(orderedIds: string[]) {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Update orders in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lead.update({
          where: { id, userId },
          data: { order: index },
        })
      )
    )

    // Invalidate cache
    await invalidateCache(`leads:${userId}`)
    revalidatePath('/dashboard/leads')

    return { success: true }
  } catch (error) {
    console.error("Failed to reorder leads:", error)
    return { success: false, error: "Failed to reorder leads" }
  }
}
