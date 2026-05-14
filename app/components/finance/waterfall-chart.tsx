"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WaterfallChartProps {
  data: { name: string; amount: number; isTotal?: boolean }[];
}

export function WaterfallChart({ data }: WaterfallChartProps) {
  // Convert data for the waterfall logic
  // We need to keep a running total to know where the bar starts
  let runningTotal = 0;
  const processedData = data.map((item) => {
    if (item.isTotal) {
      runningTotal = item.amount;
      return {
        name: item.name,
        start: 0,
        end: item.amount,
        amount: item.amount,
        isTotal: true,
      };
    }

    const start = runningTotal;
    const end = runningTotal + item.amount;
    runningTotal = end;

    return {
      name: item.name,
      start: Math.min(start, end),
      end: Math.max(start, end),
      amount: item.amount,
      isTotal: false,
    };
  });

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 w-full h-[400px]">
      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] mb-6">Cashflow Waterfall</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717A" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: "#71717A" }} axisLine={false} tickLine={false} />
          <Tooltip 
            formatter={(val: any, name: any, props: any) => [`$${props.payload.amount}`, "Amount"]}
            cursor={{ fill: "transparent" }}
            contentStyle={{ borderRadius: 0, border: "1px solid #E5E5E5", boxShadow: "none" }}
          />
          <Bar dataKey="end" stackId="a" fill="transparent" />
          <Bar dataKey="start" stackId="a">
            {processedData.map((entry, index) => {
              let fill = "#0A0A0A"; // Total or positive
              if (!entry.isTotal && entry.amount < 0) fill = "#DC2626"; // Red for negative
              if (!entry.isTotal && entry.amount > 0) fill = "#16A34A"; // Green for positive
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
