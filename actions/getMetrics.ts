'use server'

import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/session"

export async function getProjectCount() {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return { success: false, error: "Unauthorized" }

    const count = await prisma.project.count({
      where: { userId }
    })
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch project count:", error)
    return { success: false, error: "Failed to fetch project count" }
  }
}

export async function getCriticalPriotiryCount(){
   try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return { success: false, error: "Unauthorized" }

    const count = await prisma.project.count({
      where: {
        priority: "Critical",
        userId,
      },
    })
    return { success: true, count }
  } catch (error) {
    console.error("Failed to fetch critical priority count:", error)
    return { success: false, error: "Failed to fetch critical priority count" }
  }
}

export async function getDashboardMetrics(spaceId: string) {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()
    if (!isAuthenticatedAndLogedIn || !userId) return { success: false, error: "Unauthorized" }

    // 1. Total Revenue (Sum of all incomes in this space)
    const incomes = await prisma.income.findMany({
      where: { spaceId }
    })
    const totalRevenue = incomes.reduce((acc, curr) => acc + curr.amount, 0)

    // 2. Active Projects (Not DONE or CANCELED)
    const activeProjectsCount = await prisma.project.count({
      where: { 
        spaceId,
        projectStatus: {
          notIn: ["DONE", "CANCELED"]
        }
      }
    })

    // 3. New Leads (Created in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newLeadsCount = await prisma.lead.count({
      where: { 
        spaceId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 4. Critical Projects (for the badge)
    const criticalProjectsCount = await prisma.project.count({
      where: {
        spaceId,
        priority: "Critical"
      }
    })

    return { 
      success: true, 
      metrics: {
        totalRevenue,
        activeProjectsCount,
        newLeadsCount,
        criticalProjectsCount
      }
    }
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error)
    return { success: false, error: "Failed to fetch dashboard metrics" }
  }
}
