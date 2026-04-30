'use server'

import { prisma } from "@/lib/prisma"

export async function getProjectCount() {
  try {
    const count = await prisma.project.count()
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch project count:", error)
    return { success: false, error: "Failed to fetch project count" }
  }
}

export async function getCriticalPriotiryCount(){
   try {
    const count = await prisma.project.count({
      where: {
        priority: "Critical",
      },
    })
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch critical priority count:", error)
    return { success: false, error: "Failed to fetch critical priority count" }
  }
}
