"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Clock, CheckSquare, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/app/context/TranslationContext";

interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface TaskProps {
  id: string;
  title: string;
  priority: string;
  dueDate?: Date | string | null;
  workload?: number | null;
  subtasks?: Subtask[] | null;
  employee?: {
    name: string;
    id: string;
  } | null;
}

interface TaskCardProps {
  task: TaskProps;
  index: number;
  onClick: (task: TaskProps) => void;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const { t } = useTranslation();
  // Calculate subtask progress
  const completedSubtasks = task.subtasks?.filter(st => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const priorityLabel = t(`dashboard:kanban_board.priority_${task.priority.toLowerCase()}`);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`group bg-white p-4 rounded-xl border mb-3 cursor-pointer shadow-sm transition-all duration-200
            ${snapshot.isDragging ? "shadow-lg border-black/20 rotate-1 scale-105" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}
          `}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
              {priorityLabel}
            </span>
            <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
            {task.title}
          </h4>

          {/* Footer details */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div className="flex items-center gap-3">
              {totalSubtasks > 0 && (
                <div className={`flex items-center gap-1 ${completedSubtasks === totalSubtasks ? "text-green-600" : ""}`}>
                  <CheckSquare size={14} />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{format(new Date(task.dueDate), "MMM dd")}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {task.workload ? (
                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  <Clock size={12} /> {task.workload}
                </span>
              ) : null}
              {task.employee && (
                <div 
                  className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-medium"
                  title={task.employee.name}
                >
                  {task.employee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
