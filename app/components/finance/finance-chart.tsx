"use client";

import { AreaChart } from "recharts";
import { Area } from "recharts";
import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
} from "recharts";
import { useTranslation } from "@/app/context/TranslationContext";

interface DataPoint {
  name: string;
  expenses: number;
  income: number;
  goal: number;
}

interface FinanceChartProps {
  data: DataPoint[];
}

export const FinanceChart = ({ data }: FinanceChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-[#0A0A0A] p-8 w-full h-[500px]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
            {t("dashboard:finance.revenue_chart")}
          </h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
            {t("dashboard:status.historical_data")}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0A0A0A]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{t("dashboard:finance.incomes")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#D4D4D8]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">{t("dashboard:finance.expenses")}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.05}/>
              <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F4F4F5" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: "#71717A", fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false} 
            dy={15}
          />
          <YAxis 
            tickFormatter={(val) => `$${val}`} 
            tick={{ fontSize: 10, fill: "#71717A", fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "0px", 
              border: "2px solid #0A0A0A", 
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              padding: "12px",
              backgroundColor: "#FFF"
            }}
            cursor={{ stroke: "#0A0A0A", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#0A0A0A"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIncome)"
            name={t("dashboard:finance.incomes")}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#D4D4D8"
            strokeWidth={2}
            fill="transparent"
            name={t("dashboard:finance.expenses")}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
