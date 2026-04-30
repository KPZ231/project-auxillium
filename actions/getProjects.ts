'use server'

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { revalidatePath } from "next/cache"

import { getUser } from "@/lib/session"

export const getProjects = async () => {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized", data: [] }
    }

    const projects = await prisma.project.findMany({
      where: { userId },
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
