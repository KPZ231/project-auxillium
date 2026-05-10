"use client";

import React, { useState, useMemo } from "react";
import { ProjectWorkload } from "@/actions/workload";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WorkloadTableProps {
  projects: ProjectWorkload[];
}

type SortKey = "projectName" | "totalTasks" | "doneTasks" | "overdueTasks" | "completionRatio" | "workloadScore";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<string, string> = {
  DONE: "bg-slate-100 text-slate-500",
  IN_PROGRESS: "bg-black text-white",
  CANCELED: "bg-red-50 text-red-500",
};

export default function WorkloadTable({ projects }: WorkloadTableProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey>("workloadScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [projects, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "projectName", label: "Project" },
    { key: "totalTasks", label: t("dashboard:workload.total_tasks", "Tasks"), align: "text-center" },
    { key: "doneTasks", label: t("dashboard:workload.done", "Done"), align: "text-center" },
    { key: "overdueTasks", label: t("dashboard:workload.overdue_tasks", "Overdue"), align: "text-center" },
    { key: "completionRatio", label: t("dashboard:workload.completion_rate", "Completion"), align: "text-center" },
    { key: "workloadScore", label: t("dashboard:workload.score", "Score"), align: "text-right" },
  ];

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">
          {t("dashboard:workload.project_breakdown", "Project Breakdown")}
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th key={col.key} className={`px-6 py-4 ${col.align || "text-left"}`}>
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-2 text-[9px] font-bold text-black/40 uppercase tracking-[0.3em] font-mono hover:text-black transition-colors"
                  >
                    {col.label}
                    <SortIcon column={col.key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, idx) => (
              <tr
                key={project.id}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                }`}
              >
                {/* Project Name + Status */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-block px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] shrink-0 ${
                        STATUS_STYLES[project.projectStatus] || "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {project.projectStatus.replace("_", " ")}
                    </span>
                    <span className="text-sm font-bold text-black tracking-tight truncate max-w-[200px]">
                      {project.projectName}
                    </span>
                  </div>
                </td>

                {/* Tasks */}
                <td className="px-6 py-5 text-center">
                  <span className="text-sm font-black text-black">{project.totalTasks}</span>
                </td>

                {/* Done */}
                <td className="px-6 py-5 text-center">
                  <span className="text-sm font-black text-emerald-600">{project.doneTasks}</span>
                </td>

                {/* Overdue */}
                <td className="px-6 py-5 text-center">
                  <span className={`text-sm font-black ${project.overdueTasks > 0 ? "text-red-600" : "text-slate-300"}`}>
                    {project.overdueTasks}
                  </span>
                </td>

                {/* Completion */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-24 h-1.5 bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          project.completionRatio >= 75
                            ? "bg-emerald-500"
                            : project.completionRatio >= 40
                              ? "bg-black"
                              : "bg-slate-400"
                        }`}
                        style={{ width: `${project.completionRatio}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono w-10 text-right">
                      {project.completionRatio}%
                    </span>
                  </div>
                </td>

                {/* Score */}
                <td className="px-6 py-5 text-right">
                  <span className={`text-lg font-black tracking-tight ${
                    project.workloadScore >= 10
                      ? "text-red-600"
                      : project.workloadScore >= 5
                        ? "text-black"
                        : "text-slate-400"
                  }`}>
                    {project.workloadScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
