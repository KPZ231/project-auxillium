import ProjectsHeader from "@/app/components/Dashboard/Dashboard/Projects/ProjectsHeader/ProjectsHeader";
import ProjectsGrid from "@/app/components/Dashboard/Dashboard/Projects/ProjectsGrid/ProjectsGrid";

export default function Projects() {
    return (
        <div className="flex flex-col w-full">
            <ProjectsHeader />
            <ProjectsGrid />
        </div>
    )
}