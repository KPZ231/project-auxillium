"use client";
import { useState } from "react";
import ProjectsHeader from "@/app/components/Dashboard/Dashboard/Projects/ProjectsHeader/ProjectsHeader";
import ProjectsGrid from "@/app/components/Dashboard/Dashboard/Projects/ProjectsGrid/ProjectsGrid";
import ProjectsTimeline from "@/app/components/Dashboard/Dashboard/Projects/ProjectsTimeline/ProjectsTimeline";

export default function Projects() {
    const [view, setView] = useState<"grid" | "timeline">("grid");

    return (
        <div className="flex flex-col w-full">
            <ProjectsHeader view={view} setView={setView} />
            {view === "grid" ? <ProjectsGrid /> : <ProjectsTimeline />}
        </div>
    )
}