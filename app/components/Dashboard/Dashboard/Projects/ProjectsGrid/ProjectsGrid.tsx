"use client";

import { motion, Variants } from "motion/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getProjects, forceRefreshProjects } from "@/actions/getProjects";
import { reorderProjects } from "@/actions/reorderProjects";
import { toast } from "sonner";
import { Project } from "@/lib/generated/client/browser";
import { useRouter } from "next/navigation";

const getStatusStyle = (status: string): { label: string; className: string } => {
  switch (status) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return { label: "In Progress", className: "bg-[#0A0A0A] text-[#FAFAFA]" };
    case "CANCELED":
      return { label: "Canceled", className: "bg-[#F4F4F5] text-[#71717A] border border-[#D4D4D8]" };
    case "DONE":
      return { label: "Done", className: "bg-[#0A0A0A] text-[#FAFAFA]" };
    default:
      return { label: status, className: "bg-[#F4F4F5] text-[#71717A]" };
  }
};

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const status = getStatusStyle(project.projectStatus);
  const hasImage = project.images && project.images.length > 0;
  const coverImage = hasImage ? project.images[0] : null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="block group h-full relative">
      <div className="relative w-full h-full min-h-[200px] bg-[#F4F4F5] border border-[#E5E5E5] group-hover:border-[#0A0A0A] transition-colors duration-200 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing">

        {hasImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
        )}

        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          <div className="flex items-start justify-between">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase ${status.className}`}>
              {status.label}
            </span>
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="w-7 h-7 flex items-center justify-center border border-[#D4D4D8] hover:border-[#0A0A0A] bg-white/80 text-[#0A0A0A] text-xs transition-colors duration-150 relative z-20"
              >
                ···
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false); }} />
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-[#E5E5E5] shadow-xl z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/dashboard/projects/${project.id}`);
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/dashboard/projects/${project.id}`); // Edit shares the same page
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/dashboard/tasks?projectId=${project.id}`);
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors font-medium border-t border-[#E5E5E5]"
                    >
                      Kanban Board
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
            <h3 className="text-[22px] font-black leading-[1.1] tracking-tight text-[#0A0A0A] uppercase mb-1 line-clamp-2 cursor-pointer">
              {project.projectName}
            </h3>
            <p className="text-[11px] font-normal tracking-[0.04em] text-[#71717A] uppercase line-clamp-1">
              ID: {project.id.slice(-6)} &bull; {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drag and Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data as Project[]);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading projects");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await forceRefreshProjects();
    await fetchProjects();
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyProjects = [...projects];
      const dragItemContent = copyProjects[dragItem.current];
      copyProjects.splice(dragItem.current, 1);
      copyProjects.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      
      setProjects(copyProjects);

      // Save new order to backend
      const orderedIds = copyProjects.map(p => p.id);
      const result = await reorderProjects(orderedIds);
      if (!result.success) {
        toast.error("Failed to save new project order");
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[14px] text-[#71717A]">Loading projects...</p>
      </div>
    );
  }

  return (
    <section className="w-full py-6 px-4">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 text-[12px] uppercase tracking-wider font-medium border border-[#D4D4D8] hover:border-[#0A0A0A] bg-white text-[#0A0A0A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRefreshing ? (
            <div className="w-3 h-3 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>↻</span>
          )}
          Refresh Data
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="w-full py-16 text-center border border-dashed border-[#D4D4D8] bg-[#FAFAFA]">
          <h3 className="text-[18px] font-bold text-[#0A0A0A]">No projects found</h3>
          <p className="text-[14px] text-[#71717A] mt-2">Get started by creating a new project.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#E5E5E5]"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {projects.map((project, index) => {
            let colSpan = "col-span-1";
            let rowSpan = "row-span-1";
            let minHeight = "200px";

            const isMd = typeof window !== 'undefined' && window.innerWidth >= 768;
            
            if (isMd) {
              if (index === 0) { colSpan = "md:col-span-2"; rowSpan = "md:row-span-2"; minHeight = "320px"; } 
              else if (index === 1) { colSpan = "md:col-span-1"; rowSpan = "md:row-span-2"; minHeight = "320px"; }
            }

            return (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className={`${colSpan} ${rowSpan} bg-white relative`}
                style={{ minHeight }}
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, index)}
                onDragEnter={(e: React.DragEvent<HTMLDivElement>) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
              >
                <ProjectCard project={project} />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}