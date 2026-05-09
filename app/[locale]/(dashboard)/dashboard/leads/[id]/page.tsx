import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import LeadDetailsClient from "./LeadDetailsClient"
import { Suspense } from "react"
import { getUser } from "@/lib/session"

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  const lead = await prisma.lead.findUnique({
    where: { id }
  })

  if (!lead) {
    notFound()
  }

  const isUnauthorized = !isAuthenticatedAndLogedIn || lead.userId !== userId;

  // Next.js Server Components and serialization of Dates
  const serializedLead = {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LeadDetailsClient lead={serializedLead} isUnauthorized={isUnauthorized} />
      </Suspense>
    </div>
  )
}
