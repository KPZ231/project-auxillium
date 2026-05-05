'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { invalidateCache } from "@/lib/redis"

export async function deleteLead(leadId: string, confirmationName: string) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        })

        if (!lead) {
            return { success: false, error: "Lead not found" }
        }

        if (lead.userId !== userId) {
            return { success: false, error: "Unauthorized access to lead" }
        }

        if (lead.leadName !== confirmationName) {
            return { success: false, error: "Lead name does not match" }
        }

        await prisma.lead.delete({
            where: { id: leadId }
        })

        // Invalidate cache
        await invalidateCache(`leads:${userId}`)
        revalidatePath('/dashboard/leads', 'page')

        return {
            success: true,
            message: "Lead deleted successfully!",
        }

    } catch (error) {
        console.error("[DELETE_LEAD_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while deleting the lead.",
        }
    }
}
