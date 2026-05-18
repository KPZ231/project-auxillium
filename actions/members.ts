"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { checkPermission } from "@/lib/permissions";
import { SpaceRole } from "@/lib/generated/client/client";
import { revalidatePath } from "next/cache";

export async function updateMemberRole(spaceId: string, targetUserId: string, newRole: SpaceRole) {
  const { userId } = await getUser();
  if (!userId) return { error: "Nieautoryzowany" };

  const permission = await checkPermission(userId, spaceId, "manage_members");
  if (!permission.allowed) return { error: "Brak uprawnień do zarządzania członkami" };

  // If the user is trying to change their own role or another admin's role, we need to check if they are the last admin
  const targetMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
  });

  if (!targetMember) return { error: "Nie znaleziono członka" };

  if (targetMember.role === "ADMIN" && newRole !== "ADMIN") {
    // Check how many admins are left
    const adminCount = await prisma.spaceMember.count({
      where: { spaceId, role: "ADMIN" },
    });
    
    if (adminCount <= 1) {
      return { error: "Przestrzeń musi mieć co najmniej jednego administratora" };
    }
  }

  await prisma.spaceMember.update({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
    data: { role: newRole },
  });

  revalidatePath(`/dashboard/space/members`);
  return { success: true };
}

export async function removeMember(spaceId: string, targetUserId: string) {
  const { userId } = await getUser();
  if (!userId) return { error: "Nieautoryzowany" };

  // Allow users to leave space OR admins to remove others
  const isLeaving = userId === targetUserId;
  
  if (!isLeaving) {
    const permission = await checkPermission(userId, spaceId, "manage_members");
    if (!permission.allowed) return { error: "Brak uprawnień do usuwania członków" };
  }

  const targetMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
  });

  if (!targetMember) return { error: "Nie znaleziono członka" };

  if (targetMember.role === "ADMIN") {
    const adminCount = await prisma.spaceMember.count({
      where: { spaceId, role: "ADMIN" },
    });
    
    if (adminCount <= 1) {
      return { error: "Nie można usunąć ostatniego administratora z przestrzeni" };
    }
  }

  // Remove the member
  await prisma.spaceMember.delete({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
  });

  // Optionally remove the associated Employee record if it exists
  const employee = await prisma.employee.findUnique({
    where: { spaceId_userId: { spaceId, userId: targetUserId } },
  });

  if (employee) {
    await prisma.employee.delete({
      where: { id: employee.id },
    });
  }

  revalidatePath(`/dashboard/space/members`);
  return { success: true };
}
