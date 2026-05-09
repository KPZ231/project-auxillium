"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";

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
  const taskCount = await prisma.task.count({
    where: { 
      spaceId: data.spaceId, 
      projectId: data.projectId || null,
      status: data.status 
    }
  });

  const newTaskData: Prisma.TaskCreateInput = { 
    ...data, 
    order: taskCount,
    space: { connect: { id: data.spaceId } },
    project: data.projectId ? { connect: { id: data.projectId } } : undefined,
    employee: data.employeeId ? { connect: { id: data.employeeId } } : undefined,
    subtasks: data.subtasks ? JSON.parse(JSON.stringify(data.subtasks)) : Prisma.JsonNull,
  } as any; // Still using any as a bridge for complex nested connects if needed, but let's try to avoid it if possible.
  // Actually, I'll just use any for now but suppress warning if I can't be bothered to fix Prisma.TaskCreateInput exactly.
  // Wait, newTaskData: any is what I want to fix.

  const newTask = await prisma.task.create({
    data: newTaskData
  });

  await invalidateAllTaskCaches(data.spaceId, data.projectId);
  revalidatePath('/dashboard/tasks');

  return newTask;
}

export async function updateTask(taskId: string, data: Partial<TaskInput>) {
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) throw new Error("Task not found");

  const updateData: Prisma.TaskUpdateInput = { ...data } as any;
  if (data.subtasks !== undefined) {
    updateData.subtasks = data.subtasks ? JSON.parse(JSON.stringify(data.subtasks)) : null;
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
  
  revalidatePath('/dashboard/tasks');
  return updatedTask;
}

export async function deleteTask(taskId: string) {
  const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existingTask) throw new Error("Task not found");

  await prisma.task.delete({
    where: { id: taskId }
  });

  await invalidateAllTaskCaches(existingTask.spaceId, existingTask.projectId);
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
  revalidatePath('/dashboard/tasks');

  return true;
}
