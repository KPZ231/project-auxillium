'use server'

import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ProjectStatus } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"


// 1. Zod Schema: The most scalable way to validate incoming data.
// It allows you to easily add new fields (e.g. tags, deadlines) in the future.
const addProjectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters long"),
  projectDescription: z.string(),
  projectStatus: z.nativeEnum(ProjectStatus).default(ProjectStatus.IN_PROGRESS),

  // Zakładamy, że drag and drop uploader wysyła zdjęcia na serwer/chmurę i zwraca tablicę URL-i (lub lokalnych ścieżek).
  images: z.array(z.string()).default([]),
  dueDate: z.string().optional().nullable(),
})

export type AddProjectInput = z.infer<typeof addProjectSchema>

export async function addProject(data: AddProjectInput) {
    // 2. Bezpieczeństwo i autoryzacja
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return {
            success: false,
            error: "Unauthorized: You must be logged in to create a project.",
        }
    }

    // 3. Walidacja wejścia za pomocą Zod
    const parsedData = addProjectSchema.safeParse(data)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Invalid data provided",
            details: parsedData.error.flatten().fieldErrors,
        }
    }

    const { projectName, projectDescription, projectStatus, images, dueDate } = parsedData.data

    try {
        const existingProject = await prisma.project.findUnique({
            where: { projectName }
        })

        if (existingProject) {
            return { success: false, error: "Project with this name already exists" }
        }

        // 5. Utworzenie projektu
        const newProject = await prisma.project.create({
            data: {
                projectName,
                projectDescription,
                projectStatus,
                images: images, // Używamy URL-i z Supabase
                dueDate: dueDate ? new Date(dueDate) : null,
                user: {
                    connect: { id: userId }
                }
            }
        })

        // Revalidate cache for projects grid
        revalidatePath('/dashboard/projects', 'page')

        return {
            success: true,
            projectId: newProject.id,
            message: "Project created successfully!",
        }

    } catch (error) {
        console.error("[ADD_PROJECT_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while saving the project to the database.",
        }
    }
}
