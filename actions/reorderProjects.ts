'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function reorderProjects(orderedIds: string[]) {
    const { isAuthenticatedAndLogedIn } = await getUser()

    if (!isAuthenticatedAndLogedIn) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const transactions = orderedIds.map((id, index) => {
            return prisma.project.update({
                where: { id },
                data: { order: index }
            })
        })

        await prisma.$transaction(transactions)

        revalidateTag('projects')

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
