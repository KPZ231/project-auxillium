"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";

export async function getReportData(spaceId: string, rangeType: string) {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();
    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { checkPermission } = await import("@/lib/permissions");
    const permission = await checkPermission(userId, spaceId, "read");
    if (!permission.allowed) {
      return { success: false, error: "Brak uprawnień" };
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, username: true }
    });

    // Get space details
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { members: true } }
      }
    });

    if (!space) {
      return { success: false, error: "Space not found" };
    }

    // Determine date filter
    const now = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    if (rangeType === "this-month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (rangeType === "last-month") {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (rangeType === "last-30-days") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      toDate = now;
    } else if (rangeType === "this-year") {
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      // Default to this month
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch transactions
    const [expenses, incomes, projects, tasks] = await Promise.all([
      prisma.expense.findMany({
        where: { spaceId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: "desc" }
      }),
      prisma.income.findMany({
        where: { spaceId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: "desc" }
      }),
      prisma.project.findMany({
        where: { spaceId, projectStatus: "IN_PROGRESS" },
        orderBy: { createdAt: "desc" }
      }),
      prisma.task.findMany({
        where: { spaceId, status: { not: "DONE" } },
        include: {
          employee: { select: { name: true } },
          project: { select: { projectName: true } }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const safeIso = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    return {
      success: true,
      data: {
        user,
        space: {
          id: space.id,
          name: space.spaceName,
          description: space.spaceDescription,
          owner: space.owner,
          memberCount: space._count.members
        },
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        },
        finances: {
          expenses: expenses.map(e => ({
            id: e.id,
            amount: e.amount,
            description: e.description,
            date: safeIso(e.date) || new Date().toISOString(),
            category: e.category,
            currency: e.currency
          })),
          incomes: incomes.map(i => ({
            id: i.id,
            amount: i.amount,
            description: i.description,
            date: safeIso(i.date) || new Date().toISOString(),
            category: i.category,
            currency: i.currency
          }))
        },
        projects: projects.map(p => ({
          id: p.id,
          projectName: p.projectName,
          projectStatus: p.projectStatus,
          budget: p.budget,
          dueDate: safeIso(p.dueDate),
          createdAt: safeIso(p.createdAt) || new Date().toISOString()
        })),
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: safeIso(t.dueDate),
          employee: t.employee,
          project: t.project
        }))
      }
    };
  } catch (error) {
    console.error("[GET_REPORT_DATA_ERROR]", error);
    return { success: false, error: "Failed to get report data" };
  }
}
