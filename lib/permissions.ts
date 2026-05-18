import { prisma } from "@/lib/prisma";
import { SpaceRole } from "@/lib/generated/client/client";

export const PERMISSIONS = {
  ADMIN: ['read', 'write', 'delete', 'manage_members', 'invite', 'assign'],
  MODERATOR: ['read', 'assign'],
  USER: ['read'],
};

export async function checkPermission(
  userId: string,
  spaceId: string | null | undefined,
  requiredAction: string
): Promise<{ allowed: boolean; role?: SpaceRole }> {
  try {
    if (!spaceId) {
      return { allowed: true };
    }

    const member = await prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId,
        },
      },
    });

    if (!member) {
      return { allowed: false };
    }

    const role = member.role;
    const allowedActions = PERMISSIONS[role as keyof typeof PERMISSIONS] || [];

    if (allowedActions.includes(requiredAction)) {
      return { allowed: true, role };
    }

    return { allowed: false, role };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return { allowed: false };
  }
}
