import React from "react";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";
import { getProjects } from "@/actions/getProjects";
import { KanbanClientWrapper } from "@/app/components/tasks/KanbanClientWrapper";
import { redirect } from "next/navigation";

export default async function KanbanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn } = await getUser();
  
  if (!isAuthenticatedAndLogedIn) {
    redirect(`/${locale}/login`);
  }

  const spaceId = await getActiveSpaceId();
  
  if (!spaceId) {
    return (
      <div className="flex h-full items-center justify-center text-[#71717A] text-[14px]">
        Please select or create a space to view the Kanban board.
      </div>
    );
  }

  const projectsResponse = await getProjects();
  const projects = projectsResponse.success && projectsResponse.data ? projectsResponse.data : [];

  return (
    <div className="h-[calc(100vh-110px)] md:h-[calc(100vh-145px)] w-full flex flex-col">
      <KanbanClientWrapper projects={projects as any} spaceId={spaceId} />
    </div>
  );
}
