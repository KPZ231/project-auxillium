'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ProjectStatus } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"

const updateProjectSchema = z.object({
  id: z.string(),
  projectName: z.string().min(3, "Project name must be at least 3 characters long"),
  projectDescription: z.string(),
  projectStatus: z.nativeEnum(ProjectStatus),
  budget: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  projectType: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
  clientInfo: z.string().optional().nullable(),
  assignedUsersInfo: z.string().optional().nullable(),
  clientBrief: z.string().optional().nullable(),
  websiteUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  timeline: z.string().optional().nullable(),
  milestones: z.any().optional(), // Można tu dać dokładniejszą walidację Zod, zależnie od struktury
  images: z.array(z.string()).default([]),
  dueDate: z.string().optional().nullable(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export async function updateProject(data: UpdateProjectInput) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return { success: false, error: "Unauthorized" }
    }

    const parsedData = updateProjectSchema.safeParse(data)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Invalid data provided",
            details: parsedData.error.flatten().fieldErrors,
        }
    }

    const { id, images, websiteUrl, githubUrl, dueDate, ...rest } = parsedData.data

    try {
        const existingProject = await prisma.project.findUnique({
            where: { id }
        })

        if (!existingProject) {
            return { success: false, error: "Project not found" }
        }

        if (existingProject.userId !== userId) {
            return { success: false, error: "Unauthorized access to project" }
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...rest,
                websiteUrl: websiteUrl === "" ? null : websiteUrl,
                githubUrl: githubUrl === "" ? null : githubUrl,
                dueDate: dueDate ? new Date(dueDate) : null,
                images: images,
            }
        })

        revalidatePath('/dashboard/projects', 'page')
        revalidatePath(`/dashboard/projects/${id}`, 'page')

        return {
            success: true,
            projectId: updatedProject.id,
            message: "Project updated successfully!",
        }

    } catch (error) {
        console.error("[UPDATE_PROJECT_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while updating the project.",
        }
    }
}
