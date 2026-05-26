"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "./admin-auth";
import { revalidatePath } from "next/cache";
import { invalidateUserPlanCache } from "@/lib/subscription";

export async function getAdminUsers(page = 1, pageSize = 20, search = "") {
  const { authenticated } = await verifyAdminSession();
  if (!authenticated) throw new Error("Brak autoryzacji");

  const skip = (page - 1) * pageSize;

  const whereClause = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where: whereClause,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
      authProvider: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
    },
  });

  const total = await prisma.user.count({ where: whereClause });

  return { users, total, pages: Math.ceil(total / pageSize) };
}

export async function deleteUserByAdmin(userId: string) {
  const { authenticated } = await verifyAdminSession();
  if (!authenticated) throw new Error("Brak autoryzacji");

  // Delete owned spaces first  Space.ownerId has no cascade, so this must be explicit.
  // Space deletion cascades all space-scoped data (projects, leads, members, etc.).
  await prisma.space.deleteMany({ where: { ownerId: userId } });

  // Delete the user  cascades all user-linked records (session tokens, memberships, etc.)
  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserByAdmin(userId: string, data: { name?: string, username?: string, email?: string, stripePriceId?: string | null, stripeSubscriptionId?: string | null, stripeCurrentPeriodEnd?: Date | null }) {
  const { authenticated } = await verifyAdminSession();
  if (!authenticated) throw new Error("Brak autoryzacji");

  // Normalize email
  if (data.email) data.email = data.email.toLowerCase();

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  await invalidateUserPlanCache(userId);

  revalidatePath("/admin");
  return { success: true };
}

export async function purgeAllDataByAdmin(confirmation: string) {
  const { authenticated } = await verifyAdminSession();
  if (!authenticated) throw new Error("Brak autoryzacji");

  if (confirmation !== "PURGE ALL DATA") {
    return { error: "Nieprawidłowy tekst weryfikacyjny." };
  }

  try {
    await prisma.$transaction([
      prisma.financialAuditLog.deleteMany(),
      prisma.expense.deleteMany(),
      prisma.income.deleteMany(),
      prisma.task.deleteMany(),
      prisma.generatedDocument.deleteMany(),
      prisma.project.deleteMany(),
      prisma.lead.deleteMany(),
      prisma.client.deleteMany(),
      prisma.employee.deleteMany(),
      prisma.spaceMember.deleteMany(),
      prisma.spaceInvitation.deleteMany(),
      prisma.financialLabel.deleteMany(),
      prisma.revenueGoal.deleteMany(),
      prisma.documentTemplate.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.integration.deleteMany(),
      prisma.passwordResetToken.deleteMany(),
      prisma.space.deleteMany(),
      prisma.user.deleteMany(), // Wipes users as well
    ]);

    return { success: true };
  } catch (error) {
    console.error("Purge error:", error);
    return { error: "Wystąpił błąd podczas czyszczenia bazy danych." };
  }
}
