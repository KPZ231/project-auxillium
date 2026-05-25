"use client";
import { useState } from "react";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import ProjectsGrid from "@/app/components/Dashboard/Dashboard/Projects/ProjectsGrid/ProjectsGrid";
import ProjectsTimeline from "@/app/components/Dashboard/Dashboard/Projects/ProjectsTimeline/ProjectsTimeline";
import { Plus } from "lucide-react";

export default function Projects() {
    const [view, setView] = useState<"grid" | "timeline">("grid");

    return (
        <div className="flex flex-col w-full">
            <PageHeader 
                title="dashboard:projects.page_title" 
                subtitle="dashboard:projects.page_subtitle"
                tabs={[
                    { label: "dashboard:projects.tab_grid", value: "grid" },
                    { label: "dashboard:projects.tab_calendar", value: "timeline" }
                ]}
                currentTab={view}
                onTabChange={(v) => setView(v as "grid" | "timeline")}
                primaryAction={{
                    label: "dashboard:projects.new_project",
                    href: "/dashboard/projects/new",
                    icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
                }}
            />
            {view === "grid" ? <ProjectsGrid /> : <ProjectsTimeline />}
        </div>
    )
}