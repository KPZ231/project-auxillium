"use server";

import { prisma } from "@/lib/prisma";
import { getActiveSpaceId } from "./space";
import { invalidateCache } from "@/lib/redis";
import { revalidatePath } from "next/cache";

/**
 * Assigns an employee to a project.
 */
export async function assignEmployeeToProject(projectId: string, employeeId: string) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  try {
    await prisma.project.update({
      where: { id: projectId, spaceId },
      data: {
        assignedEmployees: {
          connect: { id: employeeId },
        },
      },
    });

    await invalidateCache(`project:${projectId}`);
    await invalidateCache(`employee:${employeeId}`);
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("[ASSIGN_EMPLOYEE_ERROR]", error);
    return { success: false, error: "Failed to assign employee" };
  }
}

/**
 * Removes an employee assignment from a project.
 */
export async function unassignEmployeeFromProject(projectId: string, employeeId: string) {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  try {
    await prisma.project.update({
      where: { id: projectId, spaceId },
      data: {
        assignedEmployees: {
          disconnect: { id: employeeId },
        },
      },
    });

    await invalidateCache(`project:${projectId}`);
    await invalidateCache(`employee:${employeeId}`);
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("[UNASSIGN_EMPLOYEE_ERROR]", error);
    return { success: false, error: "Failed to unassign employee" };
  }
}

/**
 * Gets all employees assigned to a project.
 */
export async function getProjectAssignments(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignedEmployees: true,
    },
  });

  return project?.assignedEmployees || [];
}

/**
 * Generic toggle function for assignments.
 */
export async function toggleAssignment(entityId: string, employeeId: string, entityType: "project" | "task" = "project") {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) throw new Error("No active space selected");

  if (entityType === "project") {
    const isAssigned = await prisma.project.findFirst({
      where: {
        id: entityId,
        assignedEmployees: { some: { id: employeeId } },
      },
    });

    if (isAssigned) {
      return unassignEmployeeFromProject(entityId, employeeId);
    } else {
      return assignEmployeeToProject(entityId, employeeId);
    }
  }
  
  // Tasks assignment logic can be added here later
  return { success: false, error: "Unsupported entity type" };
}
