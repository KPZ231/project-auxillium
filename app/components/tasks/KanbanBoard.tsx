"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { TaskModal } from "./TaskModal";
import { updateTaskStatusAndOrder, createTask, updateTask, deleteTask } from "@/actions/tasks";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";

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

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "REVIEW", title: "Review" },
  { id: "DONE", title: "Done" },
];

export function KanbanBoard({ initialTasks, spaceId, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>("TODO");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

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
      toast.error("Failed to update task order");
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
        toast.success("Task updated");
      } else {
        const created = await createTask(data as any);
        setTasks(prev => [...prev, created]);
        toast.success("Task created");
      }
    } catch (error) {
      toast.error("An error occurred");
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setIsModalOpen(false);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-white">
      {/* Progress Bar Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8 justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Board
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Task Orchestration
          </p>
        </div>
        
        <div className="w-full md:flex-[2] md:max-w-lg">
          <div className="flex justify-between items-center mb-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>Project Momentum</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-black h-full rounded-full transition-all duration-1000 ease-in-out" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </div>
        </div>

        <div className="md:flex-1 text-left md:text-right">
          <button 
            onClick={() => handleAddTask("TODO")}
            className="w-full md:w-auto px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-black outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-all"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium ml-auto">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={filteredTasks.filter(t => t.status === column.id).sort((a, b) => a.order - b.order)}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            ))}
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
