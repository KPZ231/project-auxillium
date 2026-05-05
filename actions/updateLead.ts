'use server'

import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { LeadStatus } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"
import { invalidateCache } from "@/lib/redis"

const updateLeadSchema = z.object({
  id: z.string(),
  leadName: z.string().min(3, "Lead name must be at least 3 characters long"),
  leadInfo: z.string().optional().nullable(),
  status: z.nativeEnum(LeadStatus),
  projectType: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  email: z.string().email("Must be a valid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  turnedIntoClient: z.boolean().optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

export async function updateLead(data: UpdateLeadInput) {
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return { success: false, error: "Unauthorized" }
    }

    const parsedData = updateLeadSchema.safeParse(data)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Invalid data provided",
            details: parsedData.error.flatten().fieldErrors,
        }
    }

    const { id, email, ...rest } = parsedData.data

    try {
        const existingLead = await prisma.lead.findUnique({
            where: { id }
        })

        if (!existingLead) {
            return { success: false, error: "Lead not found" }
        }

        if (existingLead.userId !== userId) {
            return { success: false, error: "Unauthorized access to lead" }
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: {
                ...rest,
                email: email === "" ? null : email,
            }
        })

        // Invalidate cache
        await invalidateCache(`leads:${userId}`)
        revalidatePath('/dashboard/leads', 'page')
        revalidatePath(`/dashboard/leads/${id}`, 'page')

        return {
            success: true,
            leadId: updatedLead.id,
            message: "Lead updated successfully!",
        }

    } catch (error) {
        console.error("[UPDATE_LEAD_ERROR]", error)
        return {
            success: false,
            error: "An unexpected error occurred while updating the lead.",
        }
    }
}
