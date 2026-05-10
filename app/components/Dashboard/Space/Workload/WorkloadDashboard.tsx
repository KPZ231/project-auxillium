"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "motion/react";
import { getWorkloadData, WorkloadData, WorkloadFilters } from "@/actions/workload";
import WorkloadFiltersBar from "./WorkloadFilters";
import WorkloadSummaryCards from "./WorkloadSummaryCards";
import WorkloadChart from "./WorkloadChart";
import WorkloadTable from "./WorkloadTable";
import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WorkloadDashboardProps {
  spaceId: string;
  spaceName: string;
}

export default function WorkloadDashboard({ spaceId, spaceName }: WorkloadDashboardProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [filters, setFilters] = useState<WorkloadFilters>({});

  const fetchData = useCallback(async (currentFilters: WorkloadFilters, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const result = await getWorkloadData(currentFilters);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch workload data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const handleFilterChange = useCallback((newFilters: WorkloadFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(filters, true);
  }, [filters, fetchData]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.5em] font-mono">
            Loading workload data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── HEADER ── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.5em] font-mono">
            {spaceName}
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            {t("dashboard:workload.title", "Workload")}
          </h1>
          <p className="text-sm text-slate-400 font-light max-w-md">
            {t("dashboard:workload.subtitle", "Space workload analysis and task distribution")}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-3 px-6 py-3 bg-black text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* ── FILTERS ── */}
      <motion.div variants={itemVariants}>
        <WorkloadFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          employees={data?.employees || []}
        />
      </motion.div>

      {/* ── SUMMARY CARDS ── */}
      <motion.div variants={itemVariants}>
        {data && <WorkloadSummaryCards summary={data.summary} />}
      </motion.div>

      {/* ── CHART SECTION ── */}
      <motion.div variants={itemVariants}>
        <div className="border border-slate-200 bg-white">
          {/* Chart Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">
              {t("dashboard:workload.project_breakdown", "Project Breakdown")}
            </h2>
            <div className="flex items-center gap-0 border border-slate-200">
              <button
                onClick={() => setChartType("bar")}
                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  chartType === "bar"
                    ? "bg-black text-white"
                    : "bg-white text-slate-400 hover:text-black"
                }`}
              >
                {t("dashboard:workload.chart_bar", "Bar")}
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  chartType === "pie"
                    ? "bg-black text-white"
                    : "bg-white text-slate-400 hover:text-black"
                }`}
              >
                {t("dashboard:workload.chart_pie", "Pie")}
              </button>
            </div>
          </div>
          {/* Chart Body */}
          <div className="p-6">
            {data && (
              <WorkloadChart
                chartType={chartType}
                projects={data.projects}
                statusDistribution={data.statusDistribution}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── TABLE ── */}
      <motion.div variants={itemVariants}>
        {data && <WorkloadTable projects={data.projects} />}
      </motion.div>
    </motion.div>
  );
}
