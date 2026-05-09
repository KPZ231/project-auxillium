"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
} from "recharts";
import { Square, CheckSquare, Plus } from "lucide-react";

import { useTranslation } from "@/app/context/TranslationContext";

interface ChartData {
  name: string;
  value: number;
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  badge?: {
    text: string;
    type: "urgent" | "today";
  };
  completed: boolean;
}

const mockChartData: ChartData[] = [
  { name: "JAN", value: 200 },
  { name: "FEB", value: 400 },
  { name: "MAR", value: 150 },
  { name: "APR", value: 600 },
  { name: "MAY", value: 400 },
  { name: "JUN", value: 800 },
  { name: "JUL", value: 650 },
];

const mockActionItems: ActionItem[] = [
  {
    id: "1",
    title: "Review Q3 Financial Disclosures",
    assignee: "Assigned to: Legal Team",
    badge: { text: "URGENT", type: "urgent" },
    completed: false,
  },
  {
    id: "2",
    title: "Approve 'Project Zenith' Wireframes",
    assignee: "Assigned to: Design Dept",
    badge: { text: "TODAY", type: "today" },
    completed: false,
  },
  {
    id: "3",
    title: "Client Onboarding: Nexus Corp",
    assignee: "Assigned to: Account Mgmt",
    completed: false,
  },
  {
    id: "4",
    title: "Initial Server Provisioning",
    assignee: "Completed 2 hrs ago",
    completed: true,
  },
];

export default function ActivityAndTasks() {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartData[]>(mockChartData);
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="w-full px-8 mb-16">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Left Panel: Activity Trajectory */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-2 bg-white border border-gray-300 p-8 flex flex-col min-h-[500px]"
        >
          <div className="flex justify-between items-center mb-10 z-10">
            <h3 className="text-sm font-bold text-black tracking-widest uppercase">
              {t("dashboard:metrics.activity_trajectory", "Activity Trajectory")}
            </h3>
            <div className="flex border border-gray-300 bg-white">
              <button className="px-4 py-1 text-xs font-bold bg-black text-white">
                30D
              </button>
              <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50">
                90D
              </button>
              <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50 border-l border-gray-300">
                1Y
              </button>
            </div>
          </div>

          <div className="grow w-full h-full relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeWidth={1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                  dy={15}
                />
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Panel: Action Items */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 bg-white border border-gray-300 flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#e5e5e5] p-6 flex justify-between items-center border-b border-gray-300">
            <h3 className="text-sm font-bold text-black tracking-widest uppercase">
              {t("dashboard:metrics.action_items", "Action Items")}
            </h3>
            <Plus className="w-5 h-5 text-black cursor-pointer" />
          </div>

          {/* List */}
          <motion.div
            className="grow flex flex-col"
            variants={listContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {actionItems.map((item, idx) => (
              <motion.div
                key={item.id}
                variants={listItemVariants}
                className={`flex gap-4 p-6 border-b border-gray-200 last:border-b-0 ${
                  item.completed ? "opacity-50" : ""
                }`}
              >
                <div className="mt-1 shrink-0">
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-gray-500" strokeWidth={2} />
                  ) : (
                    <Square className="w-5 h-5 text-black" strokeWidth={2} />
                  )}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <p
                      className={`text-sm font-bold leading-tight ${
                        item.completed ? "text-gray-500 line-through" : "text-black"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.badge && !item.completed && (
                      <span
                        className={`text-[0.65rem] font-bold px-2 py-0.5 border uppercase tracking-wider ml-2 shrink-0 ${
                          item.badge.type === "urgent"
                            ? "border-red-400 text-red-500 bg-red-50"
                            : "border-gray-400 text-gray-600 bg-gray-100"
                        }`}
                      >
                        {t(`dashboard:status.${item.badge.type}`, item.badge.text)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{item.assignee}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="p-6 mt-auto">
            <button className="w-full py-4 border border-gray-300 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors">
              {t("dashboard:metrics.view_all_tasks", "View All Tasks")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
