"use server";

import { getUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export type ConnectorType = "google_sheets" | "google_drive" | "google_docs" | "google_calendar" | "google_tasks";

export async function getConnectedServices(): Promise<{ success: boolean; data?: Record<ConnectorType, boolean>; error?: string }> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: { provider: true }
    });

    const connectedMap: Record<ConnectorType, boolean> = {
      google_sheets: false,
      google_drive: false,
      google_docs: false,
      google_calendar: false,
      google_tasks: false,
    };

    integrations.forEach(integration => {
      if (integration.provider in connectedMap) {
        connectedMap[integration.provider as ConnectorType] = true;
      }
    });

    return { success: true, data: connectedMap };
  } catch (error) {
    console.error("[GET_CONNECTED_SERVICES_ERROR]", error);
    return { success: false, error: "Failed to fetch connected services" };
  }
}

export async function connectService(
  service: ConnectorType
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const authUrl = `/api/auth/google?provider=${service}`;
    return { success: true, url: authUrl };
  } catch (error) {
    console.error("[CONNECT_SERVICE_ERROR]", error);
    return { success: false, error: `Failed to connect to ${service}` };
  }
}

export async function disconnectService(
  service: ConnectorType
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Usuwamy token z bazy
    const deleted = await prisma.integration.deleteMany({
      where: {
        userId,
        provider: service
      }
    });

    if (deleted.count === 0) {
      return { success: false, error: "Integration not found" };
    }

    revalidatePath("/[locale]/(dashboard)/settings", "page");

    return {
      success: true,
      message: `Successfully disconnected from ${service.replace("_", " ")}`,
    };
  } catch (error) {
    console.error("[DISCONNECT_SERVICE_ERROR]", error);
    return { success: false, error: `Failed to disconnect from ${service}` };
  }
}
