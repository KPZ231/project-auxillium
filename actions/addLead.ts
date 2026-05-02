'use server'

import { getUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Lead } from "@/lib/generated/client/client"
import { revalidatePath } from "next/cache"


// 1. Zod Schema: The most scalable way to validate incoming data.
// It allows you to easily add new fields (e.g. tags, deadlines) in the future.
const addLeadShema = z.object({
  leadName: z.string().min(3, "Nazwa potencialnego klienta musi miec conajmniej 3 znaki"),
  leadInfo: z.string(),
})

export type AddLeadInput = z.infer<typeof addLeadShema>

export async function addLead(data: AddLeadInput) {
    // 2. Bezpieczeństwo i autoryzacja
    const { isAuthenticatedAndLogedIn, userId } = await getUser()

    if (!isAuthenticatedAndLogedIn || !userId) {
        return {
            success: false,
            error: "Unauthorized: You must be logged in to create a project.",
        }
    }

    // 3. Walidacja wejścia za pomocą Zod
    const parsedData = addLeadShema.safeParse(data)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Invalid data provided",
            details: parsedData.error.flatten().fieldErrors,
        }
    }

    const { leadName, leadInfo } = parsedData.data

    try {
        const existingLead = await prisma.lead.findUnique({
            where: { leadName }
        })

        if (existingLead) {
            return { success: false, error: "Lead with this name already exists" }
        }

        // 5. Utworzenie leadu
        const newLead = await prisma.lead.create({
            data: {
                leadName,
                leadInfo,
                user: {
                    connect: { id: userId }
                }
            }
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
