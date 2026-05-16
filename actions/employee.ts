"use server";

import { prisma } from "@/lib/prisma";
import { getActiveSpaceId } from "./space";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";

const CACHE_TTL = 3600; // 1 hour

interface Employee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  createdAt: Date;
  spaceId: string;
}

export async function getEmployees() {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) return [];

  const cacheKey = `employees:${spaceId}`;
  const cached = await getCachedData<Employee[]>(cacheKey);
  if (cached) return cached;

  const employees = await prisma.employee.findMany({
    where: { spaceId },
    include: {
      _count: {
        select: {
          assignedProjects: true,
          assignedTasks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  await setCachedData(cacheKey, employees, CACHE_TTL);
  return employees;
}

export async function addEmployee(data: {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  permissions?: Record<string, boolean>;
}) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  const employee = await prisma.employee.create({
    data: {
      ...data,
      spaceId,
    },
  });

  await invalidateCache(`employees:${spaceId}`);
  revalidatePath("/dashboard/space/employees");
  return { success: true, employee };
}

export async function updateEmployee(id: string, data: Partial<Record<string, unknown>>) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  const employee = await prisma.employee.update({
    where: { id, spaceId }, // Ensure it belongs to current space
    data,
  });

  await invalidateCache(`employees:${spaceId}`);
  await invalidateCache(`employee:${id}`);
  revalidatePath("/dashboard/space/employees");
  revalidatePath(`/dashboard/space/employees/${id}`);
  return { success: true, employee };
}

export async function getEmployeeById(id: string) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) return null;

  const cacheKey = `employee:${id}`;
  const cached = await getCachedData<Employee>(cacheKey);
  if (cached) return cached;

  const employee = await prisma.employee.findFirst({
    where: { id, spaceId },
    include: {
      assignedProjects: {
        select: {
          id: true,
          projectName: true,
          projectStatus: true,
        }
      },
      assignedTasks: {
        include: {
          project: {
            select: {
              projectName: true
            }
          }
        }
      },
    },
  });

  if (employee) {
    await setCachedData(cacheKey, employee, CACHE_TTL);
  }
  return employee;
}

export async function deleteEmployee(id: string) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  await prisma.employee.delete({
    where: { id, spaceId },
  });

  await invalidateCache(`employees:${spaceId}`);
  await invalidateCache(`employee:${id}`);
  revalidatePath("/dashboard/space/employees");
  return { success: true };
}

export async function getEmployeeWorkload(id: string) {
  const employee = await getEmployeeById(id);
  if (!employee) return null;

  const activeProjectsCount = employee.assignedProjects.filter((p: { projectStatus: string }) => p.projectStatus === "IN_PROGRESS").length;
  const activeTasksCount = employee.assignedTasks.filter((t: { status: string }) => t.status !== "DONE").length;

  return {
    activeProjectsCount,
    activeTasksCount,
    totalProjects: employee.assignedProjects.length,
    totalTasks: employee.assignedTasks.length,
  };
}
