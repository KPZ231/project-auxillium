"use server";

import { prisma } from "@/lib/prisma";
import { getUser, login, SESSION_DURATION } from "@/lib/session";
import { getUserPlanById } from "@/lib/subscription";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createSpace(formData: FormData) {
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const spaceName = formData.get("spaceName") as string;
  const spaceDescription = formData.get("spaceDescription") as string;

  if (!spaceName) throw new Error("Space name is required");

  const { plan, limits } = await getUserPlanById(userId)
  const spaceCount = await prisma.space.count({ where: { ownerId: userId } })
  if (limits.spaces !== null && spaceCount >= limits.spaces) {
    return { success: false, error: "SPACE_LIMIT_REACHED", plan }
  }

  const space = await prisma.space.create({
    data: {
      spaceName,
      spaceDescription,
      ownerId: userId,
      members: {
        create: {
          userId: userId,
          role: "ADMIN",
        },
      },
    },
  });

  // Set as active space
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + SESSION_DURATION);
  cookieStore.set("active_space_id", space.id, { path: "/", expires });

  // Update user's last active space
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveSpaceId: space.id }
  });

  // Update session to reflect that user now has a space
  await login(userId, true);

  revalidatePath("/dashboard");
  return { success: true, space };
}

export async function getSpaces() {
  const { userId } = await getUser();
  if (!userId) return [];

  return await prisma.space.findMany({
    where: {
      members: {
        some: { userId: userId },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          projects: true,
          employees: true,
        },
      },
    },
  });
}

export async function switchSpace(spaceId: string) {
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  // Verify access
  const space = await prisma.space.findFirst({
    where: {
      id: spaceId,
      members: {
        some: { userId: userId },
      },
    },
  });

  if (!space) throw new Error("Space not found or access denied");

  const cookieStore = await cookies();
  const expires = new Date(Date.now() + SESSION_DURATION);
  cookieStore.set("active_space_id", spaceId, { path: "/", expires });

  // Update user's last active space
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveSpaceId: spaceId }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActiveSpaceId() {
  const cookieStore = await cookies();
  return cookieStore.get("active_space_id")?.value;
}

export async function getActiveSpace() {
  const spaceId = await getActiveSpaceId();
  if (!spaceId) return null;

  return await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
