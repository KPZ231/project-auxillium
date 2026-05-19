"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";
import { MemberSelector } from "../assignments/member-selector";
import { getConnectedServices, ConnectorType } from "@/actions/connectors";
import { syncTaskToGoogleTasks, syncTaskToGoogleCalendar } from "@/actions/googleSync";
import { toast } from "sonner";
import { SiGoogletasks, SiGooglecalendar } from "react-icons/si";

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: Record<string, unknown> | null;
  defaultColumnId?: string;
  projectId?: string;
  spaceId: string;
}

export function TaskModal({ isOpen, onClose, onSave, onDelete, initialData, defaultColumnId, spaceId, projectId }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [workload, setWorkload] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [connectedServices, setConnectedServices] = useState<Record<ConnectorType, boolean>>({
    google_sheets: false,
    google_drive: false,
    google_docs: false,
    google_calendar: false,
    google_tasks: false,
  });

  useEffect(() => {
    const fetchServices = async () => {
      const res = await getConnectedServices();
      if (res.success && res.data) {
        setConnectedServices(res.data);
      }
    };
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(initialData.title as string || "");
        setDescription(initialData.description as string || "");
        setStatus(initialData.status as string || "TODO");
        setPriority(initialData.priority as string || "MEDIUM");
        setWorkload(initialData.workload as number || "");
        setDueDate(initialData.dueDate ? new Date(initialData.dueDate as string).toISOString().split('T')[0] : "");
        setEmployeeId(initialData.employeeId as string || null);
        setSubtasks(initialData.subtasks as Subtask[] || []);
      } else {
        setTitle("");
        setDescription("");
        setStatus(defaultColumnId || "TODO");
        setPriority("MEDIUM");
        setWorkload("");
        setDueDate("");
        setEmployeeId(null);
        setSubtasks([]);
      }
    }
  }, [isOpen, initialData, defaultColumnId]);

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: "", isCompleted: false }]);
  };

  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, ...updates } : st));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title,
        description,
        status,
        priority,
        workload: workload === "" ? null : Number(workload),
        dueDate: dueDate ? new Date(dueDate) : null,
        employeeId,
        subtasks,
        spaceId,
        projectId
      });
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToGoogleTasks = async () => {
    if (!initialData?.id) return;
    setSyncingTasks(true);
    const res = await syncTaskToGoogleTasks(initialData.id as string);
    if (res.success) {
      toast.success(`Synced "${res.title}" to Google Tasks`);
    } else {
      toast.error(res.error || "Failed to sync to Google Tasks");
    }
    setSyncingTasks(false);
  };

  const handleSyncToGoogleCalendar = async () => {
    if (!initialData?.id) return;
    if (!dueDate) {
      toast.error("Please set a due date before syncing to calendar");
      return;
    }
    setSyncingCalendar(true);
    const res = await syncTaskToGoogleCalendar(initialData.id as string);
    if (res.success) {
      toast.success("Synced to Google Calendar");
    } else {
      toast.error(res.error || "Failed to sync to Google Calendar");
    }
    setSyncingCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full md:h-auto max-w-full md:max-w-2xl bg-white md:shadow-2xl md:rounded-xl overflow-hidden flex flex-col max-h-screen md:max-h-[90vh]"
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">
              {initialData ? "Edit Task" : "Create Task"}
            </h2>
            {projectId && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Project Context Active
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Task title..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Workload (hrs/pts)</label>
                <input
                  type="number"
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Assignee</label>
                <button
                  type="button"
                  onClick={() => setIsMemberSelectorOpen(true)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm text-left truncate text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {employeeId ? "Change Assignee" : "Assign someone"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all h-24 resize-none"
                placeholder="Add more details..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Subtasks</label>
                <button 
                  type="button" 
                  onClick={handleAddSubtask}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add subtask
                </button>
              </div>
              {subtasks.length > 0 ? (
                <div className="space-y-2">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={(e) => updateSubtask(st.id, { isCompleted: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => updateSubtask(st.id, { title: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:border-black outline-none"
                        placeholder="Subtask title..."
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtask(st.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">
                  No subtasks added yet.
                </div>
              )}
            </div>

            {/* Google Sync Section */}
            {initialData && (
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Integrations
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSyncToGoogleTasks}
                    disabled={syncingTasks || !connectedServices.google_tasks}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg border ${
                      connectedServices.google_tasks
                        ? "border-[#E5E5E5] hover:border-[#0A0A0A] bg-white text-[#0A0A0A]"
                        : "border-[#F4F4F5] bg-[#FAFAFA] text-[#A1A1AA] cursor-not-allowed"
                    }`}
                  >
                    {syncingTasks ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0A] border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <SiGoogletasks className="w-3.5 h-3.5" />
                    )}
                    {connectedServices.google_tasks ? "Add to Google To Do" : "Google To Do Not Connected"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncToGoogleCalendar}
                    disabled={syncingCalendar || !connectedServices.google_calendar}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg border ${
                      connectedServices.google_calendar
                        ? "border-[#E5E5E5] hover:border-[#0A0A0A] bg-white text-[#0A0A0A]"
                        : "border-[#F4F4F5] bg-[#FAFAFA] text-[#A1A1AA] cursor-not-allowed"
                    }`}
                  >
                    {syncingCalendar ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0A] border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <SiGooglecalendar className="w-3.5 h-3.5" />
                    )}
                    {connectedServices.google_calendar ? "Add to Google Calendar" : "Calendar Not Connected"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    onDelete();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} /> Delete Task
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              form="task-form"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Member Selector Modal */}
      <AnimatePresence>
        {isMemberSelectorOpen && (
          <MemberSelector
            isOpen={isMemberSelectorOpen}
            onClose={() => setIsMemberSelectorOpen(false)}
            assignedIds={employeeId ? [employeeId] : []}
            onSelect={(id) => setEmployeeId(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
