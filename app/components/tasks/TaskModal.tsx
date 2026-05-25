"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";
import { MemberSelector } from "../assignments/member-selector";
import { getConnectedServices, ConnectorType } from "@/actions/connectors";
import { syncTaskToGoogleTasks, syncTaskToGoogleCalendar } from "@/actions/googleSync";
import { toast } from "sonner";
import { SiGoogletasks, SiGooglecalendar } from "react-icons/si";
import { useTranslation } from "@/app/context/TranslationContext";

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
  const { t } = useTranslation();
  
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
      toast.success(`${t("dashboard:task_modal.synced_tasks")} "${res.title}" ${t("dashboard:task_modal.synced_tasks_to")}`);
    } else {
      toast.error(res.error || t("dashboard:task_modal.sync_tasks_failed"));
    }
    setSyncingTasks(false);
  };

  const handleSyncToGoogleCalendar = async () => {
    if (!initialData?.id) return;
    if (!dueDate) {
      toast.error(t("dashboard:task_modal.sync_calendar_req"));
      return;
    }
    setSyncingCalendar(true);
    const res = await syncTaskToGoogleCalendar(initialData.id as string);
    if (res.success) {
      toast.success(t("dashboard:task_modal.synced_calendar"));
    } else {
      toast.error(res.error || t("dashboard:task_modal.sync_calendar_failed"));
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
              {initialData ? t("dashboard:task_modal.edit_task") : t("dashboard:task_modal.create_task")}
            </h2>
            {projectId && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {t("dashboard:task_modal.project_context_active")}
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.title")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder={t("dashboard:task_modal.title_placeholder")}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.status")}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                  <option value="TODO">{t("dashboard:task_modal.status_todo")}</option>
                  <option value="IN_PROGRESS">{t("dashboard:task_modal.status_in_progress")}</option>
                  <option value="REVIEW">{t("dashboard:task_modal.status_review")}</option>
                  <option value="DONE">{t("dashboard:task_modal.status_done")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.priority")}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                  <option value="LOW">{t("dashboard:task_modal.priority_low")}</option>
                  <option value="MEDIUM">{t("dashboard:task_modal.priority_medium")}</option>
                  <option value="HIGH">{t("dashboard:task_modal.priority_high")}</option>
                  <option value="CRITICAL">{t("dashboard:task_modal.priority_critical")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.due_date")}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.workload")}</label>
                <input
                  type="number"
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                  placeholder={t("dashboard:task_modal.workload_placeholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.assignee")}</label>
                <button
                  type="button"
                  onClick={() => setIsMemberSelectorOpen(true)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm text-left truncate text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {employeeId ? t("dashboard:task_modal.change_assignee") : t("dashboard:task_modal.assign_someone")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t("dashboard:task_modal.description")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all h-24 resize-none"
                placeholder={t("dashboard:task_modal.description_placeholder")}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">{t("dashboard:task_modal.subtasks")}</label>
                <button 
                  type="button" 
                  onClick={handleAddSubtask}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus size={14} /> {t("dashboard:task_modal.add_subtask")}
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
                        placeholder={t("dashboard:task_modal.subtask_placeholder")}
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
                  {t("dashboard:task_modal.no_subtasks")}
                </div>
              )}
            </div>

            {/* Google Sync Section */}
            {initialData && (
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                  {t("dashboard:task_modal.integrations")}
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
                    {connectedServices.google_tasks ? t("dashboard:task_modal.add_google_tasks") : t("dashboard:task_modal.google_tasks_not_connected")}
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
                    {connectedServices.google_calendar ? t("dashboard:task_modal.add_google_calendar") : t("dashboard:task_modal.google_calendar_not_connected")}
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
                  if (confirm(t("dashboard:task_modal.delete_confirm"))) {
                    onDelete();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} /> {t("dashboard:task_modal.delete_task")}
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t("dashboard:task_modal.cancel")}
            </button>
            <button
              form="task-form"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? t("dashboard:task_modal.saving") : t("dashboard:task_modal.save_task")}
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
