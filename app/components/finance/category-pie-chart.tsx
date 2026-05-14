"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryPieChartProps {
  data: Record<string, { income: number; expense: number }>;
}

const COLORS = ["#0A0A0A", "#71717A", "#D4D4D8", "#F4F4F5", "#16A34A", "#CA8A04", "#DC2626"];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = Object.keys(data)
    .map((key) => ({
      name: key,
      value: data[key].expense,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 w-full h-[400px]">
      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] mb-6">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ borderRadius: 0, border: "1px solid #E5E5E5", boxShadow: "none" }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px" }}
            iconType="square"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
