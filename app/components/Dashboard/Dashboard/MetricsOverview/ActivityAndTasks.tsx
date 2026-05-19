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
import { getFinancialSummary } from "@/actions/finance";
import { getRecentTasks } from "@/actions/tasks";
import { getActiveSpaceId } from "@/actions/space";
import Link from "next/link";

import { useTranslation } from "@/app/context/TranslationContext";

interface ChartData {
  name: string;
  income: number;
  expenses: number;
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

export default function ActivityAndTasks() {
  const { t, language } = useTranslation();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const spaceId = await getActiveSpaceId();
      if (!spaceId) return;

      // Fetch Financial Summary
      const financeResult = await getFinancialSummary(spaceId) as { months?: { name: string; income: number; expenses: number }[] };
      if (financeResult && financeResult.months) {
         
        setChartData(financeResult.months.map((m) => ({
          name: m.name,
          income: m.income,
          expenses: m.expenses
        })));
      }

      // Fetch All Active Tasks
      const tasksResult = await getRecentTasks(spaceId);
      if (tasksResult.success && tasksResult.tasks) {
        setActionItems(tasksResult.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          assignee: task.employee ? `Assigned to: ${task.employee.name}` : (task.project ? `Project: ${task.project.projectName}` : "Unassigned"),
          badge: task.priority === "HIGH" ? { text: "URGENT", type: "urgent" } : (task.dueDate ? { text: "TODAY", type: "today" } : undefined),
          completed: task.status === "DONE"
        })));
      }
    };
     
    fetchData();
  }, []);

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
    <section className="w-full px-4 md:px-8 mb-16">
      <motion.div
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Left Panel: Activity Trajectory */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-2 bg-white border border-gray-300 p-4 md:p-8 flex flex-col min-h-[500px]"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 z-10">
            <h3 className="text-sm font-bold text-black tracking-widest uppercase">
              {t("dashboard:metrics.revenue_expenses", "Revenue & Expenses")}
            </h3>
            <div className="flex border border-gray-300 bg-white">
              <div className="flex items-center gap-4 px-4 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-black"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("dashboard:finance.income", "Income")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t("dashboard:finance.expenses", "Expenses")}</span>
                </div>
              </div>
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
                  type="monotone"
                  dataKey="income"
                  stroke="#000"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#000" }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#d1d5db"
                  strokeWidth={2}
                  strokeDasharray="5 5"
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
          <div
            className="grow flex flex-col max-h-[400px] overflow-y-auto"
          >
            {actionItems.map((item, idx) => (
              <div
                key={item.id}
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
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 mt-auto">
            <Link href={`/${language}/dashboard/tasks`} className="block w-full py-4 border border-gray-300 text-center text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors">
              {t("dashboard:metrics.view_all_tasks", "View All Tasks")}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
