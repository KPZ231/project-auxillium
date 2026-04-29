import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProjectDetailsClient from "./ProjectDetailsClient"
import { Suspense } from "react"

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project) {
    notFound()
  }

  // Next.js Server Components and serialization of Dates
  const serializedProject = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectDetailsClient project={serializedProject} />
      </Suspense>
    </div>
  )
}
