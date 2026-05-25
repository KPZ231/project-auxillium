"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { TaskModal } from "./TaskModal";
import { updateTaskStatusAndOrder, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  order: number;
  [key: string]: unknown;
}

interface KanbanBoardProps {
  initialTasks: Task[];
  spaceId: string;
  projectId?: string;
}

const getColumns = (t: any) => [
  { id: "TODO", title: t("dashboard:kanban_board.status_todo") },
  { id: "IN_PROGRESS", title: t("dashboard:kanban_board.status_in_progress") },
  { id: "REVIEW", title: t("dashboard:kanban_board.status_review") },
  { id: "DONE", title: t("dashboard:kanban_board.status_done") },
];

export function KanbanBoard({ initialTasks, spaceId, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>("TODO");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<string>("TODO");
  const { t } = useTranslation();
  
  const COLUMNS = getColumns(t);

  // Sync state with props
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(initialTasks);
  }, [initialTasks]);

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Project Progress Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic Update
    const newTasks = Array.from(tasks);
    const movedTaskIndex = newTasks.findIndex(t => t.id === draggableId);
    if (movedTaskIndex === -1) return;

    const movedTask = newTasks[movedTaskIndex];
    newTasks.splice(movedTaskIndex, 1);
    
    movedTask.status = destination.droppableId;
    
    // Insert into new position
    const destinationTasks = newTasks.filter(t => t.status === destination.droppableId);
    destinationTasks.splice(destination.index, 0, movedTask);

    // Reconstruct full array with updated order for destination column
    destinationTasks.forEach((t, i) => t.order = i);
    
    // Replace old destination tasks with new ones
    const filteredTasks = newTasks.filter(t => t.status !== destination.droppableId);
    const finalTasks = [...filteredTasks, ...destinationTasks];
    
    setTasks(finalTasks);

    // API Call
    try {
      await updateTaskStatusAndOrder(
        draggableId,
        destination.droppableId,
        destination.index,
        destinationTasks.map(t => ({ id: t.id, order: t.order }))
      );
    } catch (error) {
      console.error("Failed to update task order", error);
      toast.error(t("dashboard:kanban_board.failed_update_order"));
      setTasks(tasks); // Rollback
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (columnId: string) => {
    setSelectedTask(null);
    setDefaultColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (data: Record<string, unknown>) => {
    try {
      if (selectedTask) {
        const updated = await updateTask(selectedTask.id, data as any);
        // Use the server-returned data to ensure all relations and IDs are correct
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success(t("dashboard:kanban_board.task_updated"));
      } else {
        const created = await createTask(data as any);
        setTasks(prev => [...prev, created]);
        toast.success(t("dashboard:kanban_board.task_created"));
      }
    } catch (error) {
      toast.error(t("dashboard:kanban_board.error_occurred"));
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setIsModalOpen(false);
      toast.success(t("dashboard:kanban_board.task_deleted"));
    } catch (error) {
      toast.error(t("dashboard:kanban_board.failed_delete"));
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-white">
      {/* Progress Bar Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex flex-row items-center gap-4 justify-between">
        <div className="hidden md:block md:flex-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            {t("dashboard:kanban_board.board_title")}
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            {t("dashboard:kanban_board.board_subtitle")}
          </p>
        </div>
        
        <div className="flex-1 max-w-xs md:max-w-md">
          <div className="flex justify-between items-center mb-1 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>{t("dashboard:kanban_board.project_momentum")}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-black h-full rounded-full transition-all duration-1000 ease-in-out" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </div>
        </div>

        <div className="flex-shrink-0">
          <button 
            onClick={() => handleAddTask(activeTab)}
            className="px-3 py-2 md:px-4 md:py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
          >
            {t("dashboard:kanban_board.new_task")}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 md:px-6 md:py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t("dashboard:kanban_board.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-3 w-full sm:w-auto sm:ml-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-all"
            >
              <option value="ALL">{t("dashboard:kanban_board.all_priorities")}</option>
              <option value="LOW">{t("dashboard:kanban_board.priority_low")}</option>
              <option value="MEDIUM">{t("dashboard:kanban_board.priority_medium")}</option>
              <option value="HIGH">{t("dashboard:kanban_board.priority_high")}</option>
              <option value="CRITICAL">{t("dashboard:kanban_board.priority_critical")}</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {t("dashboard:kanban_board.showing_tasks", { count: filteredTasks.length, total: tasks.length })}
          </div>
        </div>
      </div>

      {/* Mobile Column Tabs */}
      <div className="flex md:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        {COLUMNS.map(column => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);
          const isActive = activeTab === column.id;
          return (
            <button
              key={column.id}
              onClick={() => setActiveTab(column.id)}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                isActive 
                  ? "border-black text-black" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {column.title} ({columnTasks.length})
            </button>
          );
        })}
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-auto md:overflow-y-hidden p-4 md:p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full items-stretch md:items-start w-full md:w-auto">
            {COLUMNS.map(column => {
              const isColumnActive = activeTab === column.id;
              return (
                <div 
                  key={column.id} 
                  className={`${isColumnActive ? "flex" : "hidden md:flex"} flex-col flex-1 h-full w-full md:w-auto`}
                >
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    tasks={filteredTasks.filter(t => t.status === column.id).sort((a, b) => a.order - b.order)}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleAddTask}
                  />
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
            initialData={selectedTask}
            defaultColumnId={defaultColumnId}
            spaceId={spaceId}
            projectId={projectId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
