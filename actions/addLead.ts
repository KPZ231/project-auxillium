'use server'

import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Lead, LeadStatus } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"
import { invalidateCache } from "@/lib/redis"


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

export type AddLeadInput = z.infer<typeof addLeadShema>

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

    try {
        const existingLead = await prisma.lead.findUnique({
            where: { leadName }
        })

        if (existingLead) {
            return { success: false, error: "Lead with this name already exists" }
        }

        const { getActiveSpaceId } = await import("./space");
        const spaceId = await getActiveSpaceId();

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
