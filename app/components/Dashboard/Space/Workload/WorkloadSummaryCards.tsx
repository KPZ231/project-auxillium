"use client";

import React from "react";
import { FolderKanban, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WorkloadSummary {
  totalProjects: number;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageScore: number;
}

interface WorkloadSummaryCardsProps {
  summary: WorkloadSummary;
}

export default function WorkloadSummaryCards({ summary }: WorkloadSummaryCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: "total-projects",
      label: t("dashboard:workload.total_projects", "Total Projects"),
      value: summary.totalProjects,
      icon: FolderKanban,
      detail: null,
    },
    {
      id: "total-tasks",
      label: t("dashboard:workload.total_tasks", "Total Tasks"),
      value: summary.totalTasks,
      icon: ClipboardList,
      detail: `${summary.doneTasks} ${t("dashboard:workload.done", "done")} / ${summary.inProgressTasks} ${t("dashboard:workload.in_progress", "in progress")}`,
    },
    {
      id: "completion-rate",
      label: t("dashboard:workload.completion_rate", "Completion Rate"),
      value: `${summary.completionRate}%`,
      icon: CheckCircle2,
      detail: null,
      highlight: summary.completionRate >= 75,
    },
    {
      id: "overdue-tasks",
      label: t("dashboard:workload.overdue_tasks", "Overdue Tasks"),
      value: summary.overdueTasks,
      icon: AlertTriangle,
      detail: null,
      urgent: summary.overdueTasks > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isLast = idx === cards.length - 1;

        return (
          <div
            key={card.id}
            className={`p-8 bg-white transition-colors group ${
              !isLast ? "border-r border-b sm:border-b lg:border-b-0 border-slate-200" : "border-b sm:border-b lg:border-b-0"
            } ${card.urgent ? "hover:bg-red-50" : "hover:bg-slate-50"}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                card.urgent
                  ? "bg-red-100 text-red-600"
                  : card.highlight
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-400 group-hover:bg-black group-hover:text-white"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold text-black/30 uppercase tracking-[0.4em] font-mono block">
                {card.label}
              </span>
              <p className={`text-4xl font-black tracking-tighter leading-none ${
                card.urgent ? "text-red-600" : card.highlight ? "text-emerald-600" : "text-black"
              }`}>
                {card.value}
              </p>
              {card.detail && (
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-2">
                  {card.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
