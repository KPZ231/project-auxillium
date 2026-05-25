'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getUserPlanById } from "@/lib/subscription"
import { z } from "zod"
import { LeadStatus } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"
import { invalidateCache } from "@/lib/redis"
import { createNotification } from "./notifications"


// 1. Zod Schema
const addLeadShema = z.object({
  leadName: z.string().min(3, "Nazwa potencialnego klienta musi miec conajmniej 3 znaki"),
  contactName: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email("Niepoprawny format email").optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.COLD),
  stage: z.string().optional(),
  leadInfo: z.string().optional(),
})

export type AddLeadInput = z.input<typeof addLeadShema>

export async function addLead(data: AddLeadInput) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return {
            success: false,
            error: "Unauthorized: You must be logged in to create a lead.",
        }
    }

    const parsedData = addLeadShema.safeParse(data)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Invalid data provided",
            details: parsedData.error.flatten().fieldErrors,
        }
    }

    const { leadName, contactName, role, email, phone, status, stage, leadInfo } = parsedData.data

    const { plan, limits } = await getUserPlanById(userId)
    const leadCount = await prisma.lead.count({ where: { userId } })
    if (limits.leads !== null && leadCount >= limits.leads) {
        return { success: false, error: "LEAD_LIMIT_REACHED", plan }
    }

    try {
        const existingLead = await prisma.lead.findUnique({
            where: { leadName }
        })

        if (existingLead) {
            return { success: false, error: "Lead with this name already exists" }
        }

        const { getActiveSpaceId } = await import("./space");
        const spaceId = await getActiveSpaceId();

        const { checkPermission } = await import("@/lib/permissions");
        const permission = await checkPermission(userId, spaceId, "write");
        if (!permission.allowed) {
            return { success: false, error: "Brak uprawnień do tworzenia leadów" };
        }

        // Get the current max order
        const lastLead = await prisma.lead.findFirst({
            where: { userId, ...(spaceId ? { spaceId } : {}) },
            orderBy: { order: 'desc' },
        })
        const nextOrder = lastLead ? lastLead.order + 1 : 0

        const newLead = await prisma.lead.create({
            data: {
                leadName,
                contactName,
                role,
                email,
                phone,
                status,
                stage,
                leadInfo,
                order: nextOrder,
                user: {
                    connect: { id: userId }
                },
                ...(spaceId ? { space: { connect: { id: spaceId } } } : {})
            }
        })

        // Invalidate cache
        await invalidateCache(`leads:${userId}${spaceId ? `:${spaceId}` : ""}`)
        if (spaceId) {
          await invalidateCache(`dashboard:metrics:${spaceId}`);
        }
        
        await createNotification({
            title: `Nowy potencjalny klient: ${newLead.leadName}`,
            message: `Lead został pomyślnie utworzony w przestrzeni roboczej.`,
            link: `/dashboard/leads`,
            spaceId: spaceId ?? undefined,
            userId: userId
        })
        
        revalidatePath('/dashboard/leads', 'page')

        return {
            success: true,
            leadId: newLead.id,
            message: "Lead created successfully!",
        }

    } catch (error) {
        console.error("[ADD_LEAD_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while saving the lead to the database.",
        }
    }
}
