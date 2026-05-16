'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/session"

export const getProjects = async () => {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized", data: [] }
    }

    const { getActiveSpaceId } = await import("./space");
    const spaceId = await getActiveSpaceId();

    const projects = await prisma.project.findMany({
      where: { 
        userId,
        ...(spaceId ? { spaceId } : {})
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    })
    return { success: true, data: projects }
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return { success: false, error: "Failed to fetch projects", data: [] }
  }
}

// Akcja do wymuszenia odświeżenia cache (np. po kliknięciu przycisku lub dodaniu projektu)
export async function forceRefreshProjects() {
  revalidatePath('/dashboard/projects', 'page')
}
