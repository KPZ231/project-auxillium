"use server";

import { getUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface UpdateProfileFormData {
  displayName: string;
  avatarUrl?: string;
}

export async function updateProfile(
  formData: UpdateProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: formData.displayName,
        avatarUrl: formData.avatarUrl || null,
      },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function deleteAccountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await import("@/lib/session").then(({ logout }) => logout());
    redirect("/login");
  } catch (error) {
    console.error("[DELETE_ACCOUNT_ERROR]", error);
    return { success: false, error: "Failed to delete account" };
  }
}
