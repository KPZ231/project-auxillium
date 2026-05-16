"use client";

import React, { useState, useCallback, useEffect } from "react";
import { WorkloadFilters } from "@/actions/workload";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WorkloadFiltersBarProps {
  filters: WorkloadFilters;
  onFilterChange: (filters: WorkloadFilters) => void;
  employees: { id: string; name: string }[];
}

const STATUS_OPTIONS = [
  { value: "ALL", labelKey: "workload.filter_all" },
  { value: "DONE", labelKey: "status.done" },
  { value: "IN_PROGRESS", labelKey: "status.in_progress" },
  { value: "CANCELED", labelKey: "status.cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", labelKey: "workload.filter_all" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const DATE_RANGE_OPTIONS = [
  { value: "all", labelKey: "workload.filter_all" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const DUE_FILTER_OPTIONS = [
  { value: "all", labelKey: "workload.filter_all" },
  { value: "overdue", labelKey: "workload.filter_overdue" },
  { value: "due_soon", labelKey: "workload.filter_due_soon" },
  { value: "no_due", labelKey: "workload.filter_no_due" },
];

export default function WorkloadFiltersBar({ filters, onFilterChange, employees }: WorkloadFiltersBarProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.searchQuery || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.searchQuery || "")) {
        onFilterChange({ ...filters, searchQuery: search || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateFilter = useCallback((key: keyof WorkloadFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === "ALL" || value === "all" ? undefined : value };
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const resetFilters = useCallback(() => {
    setSearch("");
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = filters.projectStatus || filters.taskPriority || filters.employeeId || filters.dateRange || filters.dueFilter || filters.searchQuery;

  return (
    <div className="border border-slate-200 bg-white">
      {/* Top bar — search + toggle */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-100">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 border border-slate-200 bg-white">
          <Search className="w-4 h-4 text-slate-300 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("dashboard:workload.search_projects", "Search projects...")}
            className="flex-1 text-sm font-medium placeholder:text-slate-300 bg-transparent outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all ${
            isExpanded || hasActiveFilters
              ? "bg-black text-white border-black"
              : "bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-white rounded-full ml-1" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-200 text-slate-400 hover:border-black hover:text-black transition-all"
          >
            {t("dashboard:workload.reset_filters", "Reset")}
          </button>
        )}
      </div>

      {/* Expanded filter chips */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 border-t border-slate-100">
              {/* Row 1: Status + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Status */}
                <FilterGroup label="Project Status">
                  {STATUS_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label || t(`dashboard:${opt.labelKey}`, opt.value)}
                      active={(filters.projectStatus || "ALL") === opt.value}
                      onClick={() => updateFilter("projectStatus", opt.value)}
                    />
                  ))}
                </FilterGroup>

                {/* Task Priority */}
                <FilterGroup label="Task Priority">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label || t(`dashboard:${opt.labelKey}`, opt.value)}
                      active={(filters.taskPriority || "ALL") === opt.value}
                      onClick={() => updateFilter("taskPriority", opt.value)}
                    />
                  ))}
                </FilterGroup>
              </div>

              {/* Row 2: Date Range + Due Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Range */}
                <FilterGroup label="Date Range">
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label || t(`dashboard:${opt.labelKey}`, opt.value)}
                      active={(filters.dateRange || "all") === opt.value}
                      onClick={() => updateFilter("dateRange", opt.value)}
                    />
                  ))}
                </FilterGroup>

                {/* Due Filter */}
                <FilterGroup label="Due Date">
                  {DUE_FILTER_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label || t(`dashboard:${opt.labelKey}`, opt.value)}
                      active={(filters.dueFilter || "all") === opt.value}
                      onClick={() => updateFilter("dueFilter", opt.value)}
                    />
                  ))}
                </FilterGroup>
              </div>

              {/* Row 3: Employee */}
              {employees.length > 0 && (
                <FilterGroup label="Employee">
                  <Chip
                    label={t("dashboard:workload.filter_all", "All")}
                    active={!filters.employeeId || filters.employeeId === "ALL"}
                    onClick={() => updateFilter("employeeId", "ALL")}
                  />
                  {employees.map((emp) => (
                    <Chip
                      key={emp.id}
                      label={emp.name}
                      active={filters.employeeId === emp.id}
                      onClick={() => updateFilter("employeeId", emp.id)}
                    />
                  ))}
                </FilterGroup>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <span className="text-[9px] font-bold text-black/30 uppercase tracking-[0.4em] font-mono">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${
        active
          ? "bg-black text-white border-black"
          : "bg-transparent text-slate-400 border-slate-200 hover:border-black hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}
