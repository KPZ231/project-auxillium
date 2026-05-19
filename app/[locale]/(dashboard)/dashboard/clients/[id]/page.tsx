import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ClientDetailsClient from "./ClientDetailsClient"
import { Suspense } from "react"
import { getActiveSpaceId } from "@/actions/space"
import { getUser } from "@/lib/session"

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const { isAuthenticatedAndLogedIn, userId } = await getUser()
  const spaceId = await getActiveSpaceId()

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assignedEmployees: true,
      incomes: true,
      expenses: true,
      projects: true
    }
  })

  if (!client) {
    notFound()
  }

  const isUnauthorized = !isAuthenticatedAndLogedIn || client.userId !== userId;

  const serializedClient = {
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    incomes: client.incomes.map((i: { amount: number; date: Date; createdAt: Date; updatedAt: Date }) => ({ ...i, date: i.date.toISOString(), createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() })),
    expenses: client.expenses.map((e: { amount: number; date: Date; createdAt: Date; updatedAt: Date }) => ({ ...e, date: e.date.toISOString(), createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() })),
    projects: client.projects.map((p: { createdAt: Date; updatedAt: Date; dueDate: Date | null }) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(), dueDate: p.dueDate ? p.dueDate.toISOString() : null })),
    milestones: client.milestones as Array<unknown>,
    schedule: client.schedule as Array<unknown>,
  }


 

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ClientDetailsClient client={serializedClient as any} isUnauthorized={isUnauthorized} spaceId={spaceId || ""} />
      </Suspense>
    </div>
  );
}
