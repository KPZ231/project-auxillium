'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getUserPlanById } from "@/lib/subscription"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { setCachedData, getCachedData, invalidateCache } from "@/lib/redis"
import { createNotification } from "./notifications"

// Zod Schemas
const addClientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters long"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  description: z.string().optional(),
})

const updateClientSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Client name must be at least 2 characters long"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  photoUrl: z.string().optional().or(z.literal('')),
  timeline: z.string().optional().or(z.literal('')),
  milestones: z.any().optional(),
  schedule: z.any().optional(),
})

export type AddClientInput = z.infer<typeof addClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>

export async function addClient(data: AddClientInput) {
  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  if (!isAuthenticatedAndLogedIn || !userId) {
    return { success: false, error: "Unauthorized" }
  }

  const parsedData = addClientSchema.safeParse(data)

  if (!parsedData.success) {
    return {
      success: false,
      error: "Invalid data provided",
      details: parsedData.error.flatten().fieldErrors,
    }
  }

  const { name, email, description } = parsedData.data

  const { plan, limits } = await getUserPlanById(userId)
  const clientCount = await prisma.client.count({ where: { userId } })
  if (limits.clients !== null && clientCount >= limits.clients) {
    return { success: false, error: "CLIENT_LIMIT_REACHED", plan }
  }

  try {
    const { getActiveSpaceId } = await import("./space")
    const spaceId = await getActiveSpaceId()

    const { checkPermission } = await import("@/lib/permissions");
    const permission = await checkPermission(userId, spaceId, "write");
    if (!permission.allowed) {
      return { success: false, error: "Brak uprawnień do dodawania klientów" }
    }

    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email || null,
        description: description || null,
        user: { connect: { id: userId } },
        ...(spaceId ? { space: { connect: { id: spaceId } } } : {})
      }
    })

    // Invalidate Cache
    const cacheKey = spaceId ? `clients_user_${userId}_space_${spaceId}` : `clients_user_${userId}`
    await invalidateCache(cacheKey)
    
    await createNotification({
        title: `Nowy klient: ${newClient.name}`,
        message: `Klient został pomyślnie utworzony w przestrzeni roboczej.`,
        link: `/dashboard/clients/${newClient.id}`,
        spaceId: spaceId ?? undefined,
        userId: userId
    })

    revalidatePath('/dashboard/clients', 'page')

    return {
      success: true,
      clientId: newClient.id,
      message: "Client created successfully!",
    }
  } catch (error) {
    console.error("[ADD_CLIENT_ERROR]", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function updateClient(data: UpdateClientInput) {
  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  if (!isAuthenticatedAndLogedIn || !userId) {
    return { success: false, error: "Unauthorized" }
  }

  const parsedData = updateClientSchema.safeParse(data)

  if (!parsedData.success) {
    return {
      success: false,
      error: "Invalid data provided",
      details: parsedData.error.flatten().fieldErrors,
    }
  }

  const { id, name, email, phone, description, notes, location, photoUrl, timeline, milestones, schedule } = parsedData.data

  try {
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) {
      return { success: false, error: "Client not found" }
    }

    if (client.spaceId) {
      const { checkPermission } = await import("@/lib/permissions");
      const permission = await checkPermission(userId, client.spaceId, "write");
      if (!permission.allowed) {
        return { success: false, error: "Brak uprawnień do edycji klientów w tej przestrzeni" }
      }
    } else if (client.userId !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.client.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        description: description || null,
        notes: notes || null,
        location: location || null,
        photoUrl: photoUrl || null,
        timeline: timeline || null,
        milestones: milestones ? milestones : client.milestones,
        schedule: schedule ? schedule : client.schedule,
      }
    })

    const cacheKey = client.spaceId ? `clients_user_${userId}_space_${client.spaceId}` : `clients_user_${userId}`
    await invalidateCache(cacheKey)

    revalidatePath(`/dashboard/clients/${id}`)
    revalidatePath('/dashboard/clients', 'page')

    return { success: true, message: "Client updated successfully" }
  } catch (error) {
    console.error("[UPDATE_CLIENT_ERROR]", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function deleteClient(id: string, confirmationName: string) {
  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  if (!isAuthenticatedAndLogedIn || !userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) {
      return { success: false, error: "Client not found" }
    }

    if (client.spaceId) {
      const { checkPermission } = await import("@/lib/permissions");
      const permission = await checkPermission(userId, client.spaceId, "delete");
      if (!permission.allowed) {
        return { success: false, error: "Brak uprawnień do usuwania klientów w tej przestrzeni" }
      }
    } else if (client.userId !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    if (client.name.trim() !== confirmationName.trim()) {
      return { success: false, error: "Name mismatch" }
    }

    await prisma.client.delete({ where: { id } })

    const cacheKey = client.spaceId ? `clients_user_${userId}_space_${client.spaceId}` : `clients_user_${userId}`
    await invalidateCache(cacheKey)

    revalidatePath('/dashboard/clients', 'page')

    return { success: true, message: "Client deleted successfully" }
  } catch (error) {
    console.error("[DELETE_CLIENT_ERROR]", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function getClients() {
  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  if (!isAuthenticatedAndLogedIn || !userId) {
    return []
  }

  const { getActiveSpaceId } = await import("./space")
  const spaceId = await getActiveSpaceId()

  const cacheKey = spaceId ? `clients_user_${userId}_space_${spaceId}` : `clients_user_${userId}`

  // Try fetching from Upstash Redis Cache
  const cachedClients = await getCachedData<unknown[]>(cacheKey)
  if (cachedClients) {
    return cachedClients
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        userId,
        ...(spaceId ? { spaceId } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedEmployees: true,
        incomes: true,
        expenses: true,
        projects: true
      }
    })

    // Set cache with 5 minutes TTL (300 seconds)
    await setCachedData(cacheKey, clients, 300)

    return clients
  } catch (error) {
    console.error("[GET_CLIENTS_ERROR]", error)
    return []
  }
}
