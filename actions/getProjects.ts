'use server'

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { revalidateTag } from "next/cache"

// Pobiera projekty używając cache Next.js - revalidacja co 5 minut (300 sekund)
export const getProjects = unstable_cache(
  async () => {
    try {
      const projects = await prisma.project.findMany({
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
  },
  ['all-projects-grid'],
  { revalidate: 300, tags: ['projects'] }
)

// Akcja do wymuszenia odświeżenia cache (np. po kliknięciu przycisku lub dodaniu projektu)
export async function forceRefreshProjects() {
  revalidateTag('projects')
}
