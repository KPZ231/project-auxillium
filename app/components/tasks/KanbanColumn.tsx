"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  order: number;
  [key: string]: unknown;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[350px] bg-gray-50/50 rounded-2xl h-full border border-gray-100 overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="text-gray-400 hover:text-black transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 transition-colors duration-200
              ${snapshot.isDraggingOver ? "bg-gray-100/80" : "bg-transparent"}
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onClick={onTaskClick as any} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
