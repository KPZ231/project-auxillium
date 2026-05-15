"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslation } from "@/app/context/TranslationContext";

interface CategoryPieChartProps {
  data: Record<string, { income: number; expense: number }>;
}

const COLORS = ["#0A0A0A", "#404040", "#737373", "#A3A3A3", "#D4D4D4", "#E5E5E5"];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { t } = useTranslation();
  const chartData = Object.keys(data)
    .map((key) => ({
      name: key,
      value: data[key].expense,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="bg-white border border-[#0A0A0A] p-8 w-full h-[400px]">
      <div className="mb-8">
        <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
          {t("dashboard:finance.spending_insights")}
        </h3>
        <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
          {t("dashboard:finance.spending_insights_desc")}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            stroke="none"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ 
              borderRadius: "0px", 
              border: "2px solid #0A0A0A", 
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              padding: "12px",
              backgroundColor: "#FFF"
            }}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: "10px", 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "0.1em",
              paddingTop: "20px"
            }}
            iconType="square"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
