"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/client/client";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { invalidateWorkloadCache } from "./workload";
import { createNotification } from "./notifications";

export type Subtask = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    employee: true;
    project: true;
  };
}>;

export interface TaskInput {
  title: string;
  description?: string;
  status: string;
  priority: string;
  spaceId: string;
  projectId?: string;
  employeeId?: string | null;
  dueDate?: Date | null;
  workload?: number | null;
  subtasks?: Subtask[] | null;
}

const getTaskCacheKey = (spaceId: string, projectId?: string) => 
  projectId ? `space:${spaceId}:project:${projectId}:tasks` : `space:${spaceId}:tasks`;

const invalidateAllTaskCaches = async (spaceId: string, projectId?: string | null) => {
  // Invalidate specific project cache
  if (projectId) {
    await invalidateCache(`space:${spaceId}:project:${projectId}:tasks`);
  }
  // Always invalidate general space cache because it contains all tasks
  await invalidateCache(`space:${spaceId}:tasks`);
  // Invalidate recent tasks cache
  await invalidateCache(`space:${spaceId}:tasks:recent`);
};

export async function getTasks(spaceId: string, projectId?: string) {
  const cacheKey = getTaskCacheKey(spaceId, projectId);
  
  const cachedTasks = await getCachedData<TaskWithRelations[]>(cacheKey);
  if (cachedTasks) {
    return cachedTasks; 
  }

  const whereClause: Prisma.TaskWhereInput = { spaceId };
  if (projectId) {
    whereClause.projectId = projectId;
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      employee: true,
      project: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  await setCachedData(cacheKey, tasks, 300);

  return tasks;
}

export async function createTask(data: TaskInput) {
  const { getUser } = await import("@/lib/session");
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const { checkPermission } = await import("@/lib/permissions");
  const permission = await checkPermission(userId, data.spaceId, "read");
  if (!permission.allowed) throw new Error("Brak uprawnień do tworzenia zadań");

  const taskCount = await prisma.task.count({
    where: { 
      spaceId: data.spaceId, 
      projectId: data.projectId || null,
      status: data.status 
    }
  });

  const { spaceId, projectId, employeeId, subtasks, ...otherData } = data;

  const newTask = await prisma.task.create({
    data: {
      ...otherData,
      order: taskCount,
      space: { connect: { id: spaceId } },
      project: projectId ? { connect: { id: projectId } } : undefined,
      employee: employeeId ? { connect: { id: employeeId } } : undefined,
      subtasks: subtasks ? JSON.parse(JSON.stringify(subtasks)) : Prisma.JsonNull,
    },
    include: {
      employee: true,
      project: true
    }
  });

  await invalidateAllTaskCaches(spaceId, projectId);
  await invalidateWorkloadCache(spaceId);
  
  await createNotification({
    title: `Nowe zadanie: ${newTask.title}`,
    message: `Zadanie "${newTask.title}" zostało pomyślnie utworzone.`,
    link: `/dashboard/tasks`,
    spaceId: spaceId
  });
  
  revalidatePath('/dashboard/tasks');

  return newTask;
}

export async function updateTask(taskId: string, data: Partial<TaskInput>) {
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) throw new Error("Task not found");

  const { getUser } = await import("@/lib/session");
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const { checkPermission } = await import("@/lib/permissions");
  const permission = await checkPermission(userId, existingTask.spaceId, "read");
  if (!permission.allowed) throw new Error("Brak uprawnień do edycji zadań");

  const { spaceId, projectId, employeeId, subtasks, ...otherData } = data;

  const updateData: Prisma.TaskUpdateInput = {
    ...otherData,
    space: spaceId ? { connect: { id: spaceId } } : undefined,
    project: projectId === null ? { disconnect: true } : (projectId ? { connect: { id: projectId } } : undefined),
    employee: employeeId === null ? { disconnect: true } : (employeeId ? { connect: { id: employeeId } } : undefined),
  };

  if (subtasks !== undefined) {
    updateData.subtasks = subtasks ? JSON.parse(JSON.stringify(subtasks)) : Prisma.JsonNull;
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData
  });

  // Invalidate both old and new project caches if project changed
  await invalidateAllTaskCaches(existingTask.spaceId, existingTask.projectId);
  if (updatedTask.projectId !== existingTask.projectId) {
    await invalidateAllTaskCaches(updatedTask.spaceId, updatedTask.projectId);
  }
  await invalidateWorkloadCache(existingTask.spaceId);
  
  revalidatePath('/dashboard/tasks');
  return updatedTask;
}

export async function deleteTask(taskId: string) {
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) throw new Error("Task not found");

  const { getUser } = await import("@/lib/session");
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const { checkPermission } = await import("@/lib/permissions");
  const permission = await checkPermission(userId, existingTask.spaceId, "delete");
  if (!permission.allowed) throw new Error("Brak uprawnień do usuwania zadań");

  await prisma.task.delete({
    where: { id: taskId }
  });

  await invalidateAllTaskCaches(existingTask.spaceId, existingTask.projectId);
  await invalidateWorkloadCache(existingTask.spaceId);
  revalidatePath('/dashboard/tasks');

  return true;
}

export async function updateTaskStatusAndOrder(
  taskId: string, 
  newStatus: string, 
  newOrder: number, 
  columnTasks: { id: string, order: number }[]
) {
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) throw new Error("Task not found");

  const { getUser } = await import("@/lib/session");
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const { checkPermission } = await import("@/lib/permissions");
  const permission = await checkPermission(userId, existingTask.spaceId, "read");
  if (!permission.allowed) throw new Error("Brak uprawnień do zmiany statusu/kolejności zadań");

  const updates = columnTasks.map(t => 
    prisma.task.update({
      where: { id: t.id },
      data: { 
        order: t.order, 
        ...(t.id === taskId ? { status: newStatus } : {})
      }
    })
  );

  await prisma.$transaction(updates);

  await invalidateAllTaskCaches(existingTask.spaceId, existingTask.projectId);
  await invalidateWorkloadCache(existingTask.spaceId);
  revalidatePath('/dashboard/tasks');

  return true;
}

export async function getRecentTasks(spaceId: string, limit?: number) {
  try {
    const cacheKey = `space:${spaceId}:tasks:recent`;
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      return { success: true, tasks: limit ? cached.slice(0, limit) : cached };
    }

    const tasks = await prisma.task.findMany({
      where: { 
        spaceId,
        status: { not: "DONE" }
      },
      include: {
        employee: true,
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    await setCachedData(cacheKey, tasks, 300);

    return { success: true, tasks: limit ? tasks.slice(0, limit) : tasks };
  } catch (error) {
    console.error("Failed to fetch recent tasks:", error);
    return { success: false, error: "Failed to fetch recent tasks" };
  }
}
