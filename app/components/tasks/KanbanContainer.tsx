"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KanbanBoard } from "./KanbanBoard";
import { getTasks } from "@/actions/tasks";
import { Project } from "@/lib/generated/client/browser";
import { toast } from "sonner";
import { ChevronRight, FolderKanban, ArrowLeftRight, LayoutGrid, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { syncAllTasksToGoogle } from "@/actions/googleSync";
import { SiGoogletasks, SiGooglecalendar } from "react-icons/si";
import { getConnectedServices, ConnectorType } from "@/actions/connectors";

interface KanbanContainerProps {
  projects: Project[];
  spaceId: string;
}

export function KanbanContainer({ projects, spaceId }: KanbanContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedServices, setConnectedServices] = useState<Record<ConnectorType, boolean>>({
    google_sheets: false,
    google_drive: false,
    google_docs: false,
    google_calendar: false,
    google_tasks: false,
  });

  const fetchTasksForProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks(spaceId, projectId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast.error("Failed to load project tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      const res = await getConnectedServices();
      if (res.success && res.data) {
        setConnectedServices(res.data);
      }
    };
     
    fetchServices();
  }, []);

  // Handle URL changes and data fetching
  useEffect(() => {
    const syncProject = async () => {
      if (urlProjectId) {
        if (urlProjectId !== selectedProjectId) {
          setSelectedProjectId(urlProjectId);
          localStorage.setItem(`kanban_project_space_${spaceId}`, urlProjectId);
          await fetchTasksForProject(urlProjectId);
        }
      } else {
        // If no URL project, clear selection to show the selection screen
        setSelectedProjectId(null);
      }
    };

    syncProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProjectId, spaceId, projects]);

  const handleProjectChange = (projectId: string) => {
    router.push(`?projectId=${projectId}`, { scroll: false });
  };

  const handleRefresh = async () => {
    if (selectedProjectId) {
      await fetchTasksForProject(selectedProjectId);
      toast.success("Data refreshed");
    } else {
      router.refresh();
      toast.success("Project list refreshed");
    }
  };

  const handleGlobalSync = async (target: "tasks" | "calendar") => {
    if (!selectedProjectId) return;
    
    const serviceName = target === "tasks" ? "Google Tasks" : "Google Calendar";
    const isConnected = target === "tasks" ? connectedServices.google_tasks : connectedServices.google_calendar;

    if (!isConnected) {
      toast.error(`${serviceName} is not connected. Please connect it in settings.`);
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading(`Syncing all tasks to ${serviceName}...`);
    
    try {
      const res = await syncAllTasksToGoogle(selectedProjectId, target);
      if (res.success) {
        toast.success(res.message, { id: toastId });
      } else {
        toast.error(res.error || "Sync failed", { id: toastId });
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6 text-[#71717A] bg-[#FAFAFA]">
        <h2 className="text-[18px] font-bold text-[#0A0A0A] mb-2">No Projects Found</h2>
        <p className="text-[14px]">You need to create a project before managing tasks.</p>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // VIEW: Project Selection Screen
  if (!urlProjectId || !selectedProjectId) {
    return (
      <div className="flex h-full items-center justify-center bg-[#FAFAFA] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4 text-[#0A0A0A]">
              Select Project
            </h2>
            <p className="text-[#71717A] font-medium uppercase tracking-widest text-xs">
              Choose a workspace to manage tasks and track progress
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
            >
              <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh Projects
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <motion.button
                key={project.id}
                whileHover={{ scale: 1.02, borderColor: "#0A0A0A" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleProjectChange(project.id)}
                className="group flex flex-col p-6 bg-white border border-[#E5E5E5] text-left transition-all hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FolderKanban size={64} />
                </div>
                
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 block">
                  Project ID: {project.id.slice(-6)}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#0A0A0A] mb-4 group-hover:text-black">
                  {project.projectName}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase py-1 px-2 bg-[#F4F4F5] text-[#71717A]">
                    {project.projectStatus}
                  </span>
                  <ChevronRight size={18} className="text-[#0A0A0A] transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-20 border border-dashed border-[#D4D4D8] bg-white">
              <p className="text-[#71717A] mb-4">No active projects found in this space.</p>
              <button 
                onClick={() => router.push('/dashboard/projects/new')}
                className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
              >
                Create First Project
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-[#FAFAFA]">
      {/* Project Selector Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 bg-white border-b border-[#E5E5E5] flex flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#0A0A0A] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {selectedProject?.projectName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-tight text-[#0A0A0A] truncate max-w-[120px] sm:max-w-none">
              {selectedProject?.projectName}
            </h2>
            <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">
              Task Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {(connectedServices.google_tasks || connectedServices.google_calendar) && (
            <div className="flex items-center gap-2 border-l border-[#E5E5E5] pl-2">
              {connectedServices.google_tasks && (
                <button
                  onClick={() => handleGlobalSync("tasks")}
                  disabled={isSyncing}
                  title="Sync all to Google Tasks"
                  className="flex items-center justify-center w-8 h-8 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
                >
                  <SiGoogletasks size={14} className={isSyncing ? "animate-pulse" : ""} />
                </button>
              )}
              {connectedServices.google_calendar && (
                <button
                  onClick={() => handleGlobalSync("calendar")}
                  disabled={isSyncing}
                  title="Sync all to Google Calendar"
                  className="flex items-center justify-center w-8 h-8 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
                >
                  <SiGooglecalendar size={14} className={isSyncing ? "animate-pulse" : ""} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard/tasks')} // Clear URL to trigger selection view
            title="Switch Project"
            className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
          >
            <ArrowLeftRight size={14} />
            <span className="hidden sm:inline">Switch Project</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard/projects')}
            title="All Projects"
            className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">All Projects</span>
          </button>
        </div>
      </div>

      {/* Main Kanban Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
             <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <KanbanBoard 
          key={selectedProjectId} 
          initialTasks={tasks} 
          spaceId={spaceId} 
          projectId={selectedProjectId} 
        />
      </div>
    </div>
  );
}
