'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function reorderProjects(orderedIds: string[]) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const transactions = orderedIds.map((id, index) => {
            return prisma.project.updateMany({
                where: { id, userId },
                data: { order: index }
            })
        })

        await prisma.$transaction(transactions)

        revalidatePath('/dashboard/projects', 'page')

        return {
            success: true,
            message: "Projects reordered successfully",
        }
    } catch (error) {
        console.error("[REORDER_PROJECTS_ERROR]", error)
        return {
            success: false,
            error: "Failed to reorder projects",
        }
    }
}
