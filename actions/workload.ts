"use server";

import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";
import { getActiveSpaceId } from "./space";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface WorkloadFilters {
  projectStatus?: string;       // "ALL" | "DONE" | "IN_PROGRESS" | "CANCELED"
  taskPriority?: string;        // "ALL" | "LOW" | "MEDIUM" | "HIGH"
  employeeId?: string;          // Employee ID or "ALL"
  dateRange?: string;           // "7d" | "30d" | "90d" | "all"
  dueFilter?: string;           // "all" | "overdue" | "due_soon" | "no_due"
  searchQuery?: string;         // Project name search
}

export interface ProjectWorkload {
  id: string;
  projectName: string;
  projectStatus: string;
  priority: string | null;
  dueDate: string | null;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  completionRatio: number;
  workloadScore: number;
}

export interface WorkloadData {
  projects: ProjectWorkload[];
  summary: {
    totalProjects: number;
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageScore: number;
  };
  statusDistribution: { name: string; value: number }[];
  employees: { id: string; name: string }[];
}

// ──────────────────────────────────────────────
// Cache helpers
// ──────────────────────────────────────────────

const getWorkloadCacheKey = (spaceId: string, filters?: WorkloadFilters) => {
  const hash = filters ? Buffer.from(JSON.stringify(filters)).toString("base64url").slice(0, 32) : "default";
  return `workload:${spaceId}:${hash}`;
};

export async function invalidateWorkloadCache(spaceId: string) {
  // Invalidate default and patterned keys
  await invalidateCache(`workload:${spaceId}:default`);
  // For filtered caches, we rely on short TTL (300s) expiring naturally
  // but always clear the default/unfiltered view
}

// ──────────────────────────────────────────────
// Main query
// ──────────────────────────────────────────────

export async function getWorkloadData(filters?: WorkloadFilters): Promise<WorkloadData> {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) {
    return emptyWorkloadData();
  }

  const cacheKey = getWorkloadCacheKey(spaceId, filters);
  const cached = await getCachedData<WorkloadData>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  // ── Date range filter for project creation ──
  let dateFilter: Date | undefined;
  if (filters?.dateRange && filters.dateRange !== "all") {
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[filters.dateRange];
    if (days) {
      dateFilter = new Date(now);
      dateFilter.setDate(now.getDate() - days);
    }
  }

  // ── Build project where clause ──
  const projectWhere: Record<string, unknown> = { spaceId };

  if (filters?.projectStatus && filters.projectStatus !== "ALL") {
    projectWhere.projectStatus = filters.projectStatus;
  }
  if (filters?.searchQuery) {
    projectWhere.projectName = { contains: filters.searchQuery, mode: "insensitive" };
  }
  if (dateFilter) {
    projectWhere.createdAt = { gte: dateFilter };
  }

  // ── Build task where clause ──
  const taskWhere: Record<string, unknown> = { spaceId };

  if (filters?.taskPriority && filters.taskPriority !== "ALL") {
    taskWhere.priority = filters.taskPriority;
  }
  if (filters?.employeeId && filters.employeeId !== "ALL") {
    taskWhere.employeeId = filters.employeeId;
  }

  // ── Fetch data in parallel ──
  const [projects, tasks, employees] = await Promise.all([
    prisma.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        projectName: true,
        projectStatus: true,
        priority: true,
        dueDate: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: taskWhere,
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
        employeeId: true,
      },
    }),
    prisma.employee.findMany({
      where: { spaceId },
      select: { id: true, name: true },
    }),
  ]);

  // ── Compute per-project workload ──
  const projectWorkloads: ProjectWorkload[] = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);

    // Apply due date filter at task level
    let filteredTasks = projectTasks;
    if (filters?.dueFilter === "overdue") {
      filteredTasks = projectTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE");
    } else if (filters?.dueFilter === "due_soon") {
      filteredTasks = projectTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDaysLater);
    } else if (filters?.dueFilter === "no_due") {
      filteredTasks = projectTasks.filter((t) => !t.dueDate);
    }

    const totalTasks = filteredTasks.length;
    const doneTasks = filteredTasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todoTasks = filteredTasks.filter((t) => t.status === "TODO").length;
    const overdueTasks = filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE").length;
    const dueSoonTasks = filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDaysLater && t.status !== "DONE").length;

    const completionRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;

    // Workload score formula
    const rawScore = (totalTasks * 1.0) + (overdueTasks * 2.5) + (dueSoonTasks * 1.5);
    const workloadScore = Math.round(rawScore * (1 - completionRatio * 0.5) * 100) / 100;

    return {
      id: project.id,
      projectName: project.projectName,
      projectStatus: project.projectStatus,
      priority: project.priority,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      totalTasks,
      doneTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      dueSoonTasks,
      completionRatio: Math.round(completionRatio * 100),
      workloadScore,
    };
  });

  // ── Aggregate summary ──
  const totalProjects = projectWorkloads.length;
  const totalTasks = projectWorkloads.reduce((acc, p) => acc + p.totalTasks, 0);
  const doneTasks = projectWorkloads.reduce((acc, p) => acc + p.doneTasks, 0);
  const inProgressTasks = projectWorkloads.reduce((acc, p) => acc + p.inProgressTasks, 0);
  const todoTasks = projectWorkloads.reduce((acc, p) => acc + p.todoTasks, 0);
  const overdueTasks = projectWorkloads.reduce((acc, p) => acc + p.overdueTasks, 0);
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const averageScore = totalProjects > 0 ? Math.round((projectWorkloads.reduce((acc, p) => acc + p.workloadScore, 0) / totalProjects) * 100) / 100 : 0;

  // ── Status distribution for pie chart ──
  const statusDistribution = [
    { name: "Done", value: doneTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "To Do", value: todoTasks },
  ].filter((s) => s.value > 0);

  const result: WorkloadData = {
    projects: projectWorkloads,
    summary: {
      totalProjects,
      totalTasks,
      doneTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      averageScore,
    },
    statusDistribution,
    employees: employees.map((e) => ({ id: e.id, name: e.name })),
  };

  await setCachedData(cacheKey, result, 300);
  return result;
}

// ──────────────────────────────────────────────
// Empty state helper
// ──────────────────────────────────────────────

function emptyWorkloadData(): WorkloadData {
  return {
    projects: [],
    summary: {
      totalProjects: 0,
      totalTasks: 0,
      doneTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      averageScore: 0,
    },
    statusDistribution: [],
    employees: [],
  };
}
