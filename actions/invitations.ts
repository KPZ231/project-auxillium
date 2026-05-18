"use server";

import { prisma } from "@/lib/prisma";
import { getUser, login, SESSION_DURATION } from "@/lib/session";
import { checkPermission } from "@/lib/permissions";
import { SpaceRole } from "@/lib/generated/client/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function inviteByEmail(spaceId: string, email: string, role: SpaceRole) {
  const { userId } = await getUser();
  if (!userId) return { error: "Nieautoryzowany" };

  const permission = await checkPermission(userId, spaceId, "invite");
  if (!permission.allowed) return { error: "Brak uprawnień do zapraszania" };

  // Validate if already a member
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const existingMember = await prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId: user.id,
        },
      },
    });
    if (existingMember) {
      return { error: "Użytkownik już jest członkiem tej przestrzeni" };
    }
  }

  // Generate token and set expiry to 7 days
  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.spaceInvitation.create({
    data: {
      spaceId,
      invitedEmail: email,
      inviteToken,
      role,
      expiresAt,
      createdById: userId,
    },
  });

  // Mocking email sending for now
  console.log(`[MOCK EMAIL] To: ${email} -> Link: /invite/${inviteToken}`);

  revalidatePath(`/dashboard/space/members`);
  return { success: true };
}

export async function generateInviteLink(spaceId: string, role: SpaceRole) {
  const { userId } = await getUser();
  if (!userId) return { error: "Nieautoryzowany" };

  const permission = await checkPermission(userId, spaceId, "invite");
  if (!permission.allowed) return { error: "Brak uprawnień do generowania linku" };

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.spaceInvitation.create({
    data: {
      spaceId,
      inviteToken,
      role,
      expiresAt,
      createdById: userId,
    },
  });

  revalidatePath(`/dashboard/space/members`);
  return { success: true, link: `/invite/${invitation.inviteToken}` };
}

export async function acceptInvitation(token: string) {
  const { userId } = await getUser();
  if (!userId) return { error: "Nieautoryzowany", code: "UNAUTHORIZED" };

  const invitation = await prisma.spaceInvitation.findUnique({
    where: { inviteToken: token },
  });

  if (!invitation) {
    return { error: "Zaproszenie nie istnieje." };
  }

  if (invitation.status !== "PENDING") {
    return { error: "Zaproszenie zostało już wykorzystane lub wygasło." };
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.spaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    return { error: "Zaproszenie wygasło." };
  }

  // Check if user is already a member
  const existingMember = await prisma.spaceMember.findUnique({
    where: {
      spaceId_userId: {
        spaceId: invitation.spaceId,
        userId: userId,
      },
    },
  });

  if (existingMember) {
    return { error: "Jesteś już członkiem tej przestrzeni." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) return { error: "Nie znaleziono użytkownika." };

  // Transaction to update invitation, add member, add employee
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Add member
      await tx.spaceMember.create({
        data: {
          spaceId: invitation.spaceId,
          userId: userId,
          role: invitation.role,
        },
      });

      // 2. Mark invitation accepted
      await tx.spaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      // 3. Create employee record
      await tx.employee.create({
        data: {
          userId: userId,
          name: currentUser.name || currentUser.username || "Nowy pracownik",
          email: currentUser.email,
          spaceId: invitation.spaceId,
        },
      });
    });
  } catch (error) {
    console.error("Błąd podczas akceptacji zaproszenia:", error);
    return { error: "Wystąpił błąd podczas dołączania do przestrzeni." };
  }

  // Switch active space to the new one
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + SESSION_DURATION);
  cookieStore.set("active_space_id", invitation.spaceId, { path: "/", expires });

  // Update session to reflect that the user now has a space (prevents proxy.ts redirecting to onboarding)
  await login(userId, true);

  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveSpaceId: invitation.spaceId }
  });

  return { success: true, spaceId: invitation.spaceId };
}
