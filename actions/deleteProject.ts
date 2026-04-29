'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function deleteProject(projectId: string, confirmationName: string) {
    const { isAuthenticatedAndLogedIn } = await getUser()

    if (!isAuthenticatedAndLogedIn) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (project.projectName !== confirmationName) {
            return { success: false, error: "Project name does not match" }
        }

        // Usuń powiązane zdjęcia z dysku
        for (const imageUrl of project.images) {
            if (imageUrl.startsWith("/uploads/")) {
                const filename = imageUrl.replace("/uploads/", "")
                const filePath = path.join(process.cwd(), "public", "uploads", filename)
                if (existsSync(filePath)) {
                    await fs.unlink(filePath)
                }
            }
        }

        await prisma.project.delete({
            where: { id: projectId }
        })

        revalidatePath('/dashboard/projects', 'page')

        return {
            success: true,
            message: "Project deleted successfully!",
        }

    } catch (error) {
        console.error("[DELETE_PROJECT_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while deleting the project.",
        }
    }
}
