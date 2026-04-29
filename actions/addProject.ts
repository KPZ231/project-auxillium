'use server'

import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ProjectStatus } from "@/lib/generated/client/client"
import { revalidateTag } from "next/cache"


// 1. Zod Schema: The most scalable way to validate incoming data.
// It allows you to easily add new fields (e.g. tags, deadlines) in the future.
const addProjectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters long"),
  projectDescription: z.string(),
  projectStatus: z.nativeEnum(ProjectStatus).default(ProjectStatus.IN_PROGRESS),

  // Zakładamy, że drag and drop uploader wysyła zdjęcia na serwer/chmurę i zwraca tablicę URL-i (lub lokalnych ścieżek).
  images: z.array(z.string()).default([]),
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

    const { projectName, projectDescription, projectStatus, images } = parsedData.data

    try {
        const existingProject = await prisma.project.findUnique({
            where: { projectName }
        })

        if (existingProject) {
            return { success: false, error: "Project with this name already exists" }
        }

        // 4. Przenoszenie zdjęć z katalogu tymczasowego do docelowego
        const fs = await import("fs/promises")
        const path = await import("path")
        const { existsSync } = await import("fs")

        const finalImages: string[] = []
        const uploadsDir = path.join(process.cwd(), "public", "uploads")

        if (!existsSync(uploadsDir)) {
            await fs.mkdir(uploadsDir, { recursive: true })
        }

        for (const tempUrl of images) {
            // tempUrl wygląda np. tak: "/temp_uploads/1234-abcd.png"
            if (tempUrl.startsWith("/temp_uploads/")) {
                const filename = tempUrl.replace("/temp_uploads/", "")
                const tempPath = path.join(process.cwd(), "public", "temp_uploads", filename)
                const finalPath = path.join(uploadsDir, filename)

                if (existsSync(tempPath)) {
                    // Przenieś plik (zamiast kopiować, by oszczędzać miejsce)
                    await fs.rename(tempPath, finalPath)
                    finalImages.push(`/uploads/${filename}`)
                }
            } else if (tempUrl.startsWith("/uploads/")) {
                // Jeśli edytujesz projekt i obraz już tam jest
                finalImages.push(tempUrl)
            }
        }

        // 5. Utworzenie projektu
        const newProject = await prisma.project.create({
            data: {
                projectName,
                projectDescription,
                projectStatus,
                images: finalImages, // Używamy docelowych URL-i
                user: {
                    connect: { id: userId }
                }
            }
        })

        // Revalidate cache for projects grid
        revalidateTag('projects')

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
