'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { invalidateWorkloadCache } from "./workload"

export async function deleteProject(projectId: string, confirmationName: string) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (project.spaceId) {
            const { checkPermission } = await import("@/lib/permissions");
            const permission = await checkPermission(userId, project.spaceId, "delete");
            if (!permission.allowed) {
                return { success: false, error: "Brak uprawnień do usuwania projektów w tej przestrzeni" };
            }
        } else if (project.userId !== userId) {
            return { success: false, error: "Unauthorized access to project" };
        }

        if (project.projectName !== confirmationName) {
            return { success: false, error: "Project name does not match" }
        }

        // Usuń powiązane zdjęcia z Supabase Storage
        const { supabase } = await import("@/lib/supabase")
        
        for (const imageUrl of project.images) {
            // Przykładowy URL: https://xyz.supabase.co/storage/v1/object/public/project-images/filename.png
            if (imageUrl.includes("/project-images/")) {
                const filename = imageUrl.split("/project-images/").pop()
                if (filename) {
                    const { error } = await supabase.storage
                        .from('project-images')
                        .remove([filename])
                    
                    if (error) {
                        console.error("[STORAGE_DELETE_ERROR]", error)
                    }
                }
            }
        }

        await prisma.project.delete({
            where: { id: projectId }
        })

        revalidatePath('/dashboard/projects', 'page')

        // Invalidate workload cache
        if (project.spaceId) {
          await invalidateWorkloadCache(project.spaceId);
          const { invalidateCache } = await import("@/lib/redis");
          await invalidateCache(`dashboard:metrics:${project.spaceId}`);
        }

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
