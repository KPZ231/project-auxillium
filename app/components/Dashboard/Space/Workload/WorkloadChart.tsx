"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { ProjectWorkload } from "@/actions/workload";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WorkloadChartProps {
  chartType: "bar" | "pie";
  projects: ProjectWorkload[];
  statusDistribution: { name: string; value: number }[];
}

// Monochrome palette for charts
const BAR_COLORS: Record<string, string> = {
  DONE: "#A1A1AA",
  IN_PROGRESS: "#0A0A0A",
  CANCELED: "#E5E5E5",
};

const PIE_COLORS = ["#0A0A0A", "#71717A", "#D4D4D8", "#A1A1AA", "#E5E5E5"];

interface TooltipEntry {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-black text-white p-4 border-none shadow-none">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-white/60">
        {label}
      </p>
      {payload.map((entry, idx: number) => (
        <p key={idx} className="text-xs font-mono">
          {entry.name}: <span className="font-black">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-black text-white p-4 border-none shadow-none">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1 text-white/60">
        {payload[0].name}
      </p>
      <p className="text-lg font-black font-mono">{payload[0].value}</p>
    </div>
  );
};

export default function WorkloadChart({ chartType, projects, statusDistribution }: WorkloadChartProps) {
  const { t } = useTranslation();

  // Prepare bar chart data  top 12 projects by score
  const barData = [...projects]
    .sort((a, b) => b.workloadScore - a.workloadScore)
    .slice(0, 12)
    .map((p) => ({
      name: p.projectName.length > 16 ? p.projectName.slice(0, 14) + "…" : p.projectName,
      score: p.workloadScore,
      tasks: p.totalTasks,
      done: p.doneTasks,
      overdue: p.overdueTasks,
      status: p.projectStatus,
    }));

  const hasData = projects.length > 0;

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-400 font-light">
            {t("dashboard:workload.no_data", "No workload data available")}
          </p>
          <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">
            Create projects and tasks to see workload analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {chartType === "bar" ? (
        <motion.div
          key="bar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#A1A1AA", fontWeight: 700 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: "#E5E5E5" }}
                tickLine={false}
                height={60}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#A1A1AA", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: t("dashboard:workload.score", "Score"),
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 9, fill: "#A1A1AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" },
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F4F4F5" }} />
              <Bar
                dataKey="score"
                name={t("dashboard:workload.score", "Score")}
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[entry.status] || "#0A0A0A"} />
                ))}
              </Bar>
              <Bar
                dataKey="overdue"
                name="Overdue"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
                fill="#DC2626"
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <motion.div
          key="pie"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                dataKey="value"
                nameKey="name"
                strokeWidth={2}
                stroke="#FAFAFA"
              >
                {statusDistribution.map((_, idx) => (
                  <Cell key={`pie-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                verticalAlign="bottom"
                formatter={(value) => (
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#71717A" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
