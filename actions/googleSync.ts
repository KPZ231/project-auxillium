"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { createGoogleTask, createGoogleCalendarEvent } from "@/actions/ai/googleTools";

export async function syncTaskToGoogleTasks(taskId: string) {
  try {
    const { userId } = await getUser();
    if (!userId) return { success: false, error: "Unauthorized" };

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return { success: false, error: "Task not found" };

    const result = await createGoogleTask(userId, {
      title: task.title,
      notes: task.description || undefined,
      due: task.dueDate ? task.dueDate.toISOString() : undefined,
    });

    if (result.error) return { success: false, error: result.error };

    return { success: true, title: result.title };
  } catch (error) {
    console.error("[SYNC_TASK_TO_GOOGLE_TASKS_ERROR]", error);
    return { success: false, error: "Failed to sync task to Google Tasks" };
  }
}

export async function syncTaskToGoogleCalendar(taskId: string) {
  try {
    const { userId } = await getUser();
    if (!userId) return { success: false, error: "Unauthorized" };

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) return { success: false, error: "Task not found" };
    if (!task.dueDate) return { success: false, error: "Task must have a due date to be synced to calendar" };

    // Create a 1-hour event for the due date
    const start = new Date(task.dueDate);
    const end = new Date(task.dueDate);
    end.setHours(end.getHours() + 1);

    const result = await createGoogleCalendarEvent(userId, {
      summary: `[Auxilium] ${task.title}`,
      description: `${task.description || ""}\n\nProject: ${task.project?.projectName || "No Project"}`,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    if (result.error) return { success: false, error: result.error };

    return { success: true, url: result.url };
  } catch (error) {
    console.error("[SYNC_TASK_TO_GOOGLE_CALENDAR_ERROR]", error);
    return { success: false, error: "Failed to sync task to Google Calendar" };
  }
}

export async function syncAllTasksToGoogle(projectId: string, target: "tasks" | "calendar") {
  try {
    const { userId } = await getUser();
    if (!userId) return { success: false, error: "Unauthorized" };

    const tasks = await prisma.task.findMany({
      where: { projectId },
    });

    if (tasks.length === 0) return { success: false, error: "No tasks to sync" };

    let successCount = 0;
    let failCount = 0;

    for (const task of tasks) {
      let res;
      if (target === "tasks") {
        res = await syncTaskToGoogleTasks(task.id);
      } else {
        if (!task.dueDate) {
          failCount++;
          continue;
        }
        res = await syncTaskToGoogleCalendar(task.id);
      }

      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return { 
      success: true, 
      message: `Sync completed: ${successCount} succeeded, ${failCount} failed.` 
    };
  } catch (error) {
    console.error("[SYNC_ALL_TASKS_ERROR]", error);
    return { success: false, error: "Failed to sync all tasks" };
  }
}
