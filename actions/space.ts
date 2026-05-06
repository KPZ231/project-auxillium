"use server";

import { prisma } from "@/lib/prisma";
import { getUser, login } from "@/lib/session";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createSpace(formData: FormData) {
  const { userId } = await getUser();
  if (!userId) throw new Error("Unauthorized");

  const spaceName = formData.get("spaceName") as string;
  const spaceDescription = formData.get("spaceDescription") as string;

  if (!spaceName) throw new Error("Space name is required");

  const space = await prisma.space.create({
    data: {
      spaceName,
      spaceDescription,
      ownerId: userId,
      members: {
        connect: { id: userId },
      },
    },
  });

  // Set as active space
  const cookieStore = await cookies();
  cookieStore.set("active_space_id", space.id, { path: "/" });

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
        some: { id: userId },
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
        some: { id: userId },
      },
    },
  });

  if (!space) throw new Error("Space not found or access denied");

  const cookieStore = await cookies();
  cookieStore.set("active_space_id", spaceId, { path: "/" });

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
