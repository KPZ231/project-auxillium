"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "@/app/context/TranslationContext";

interface WaterfallChartProps {
  data: { name: string; amount: number; isTotal?: boolean }[];
}

export function WaterfallChart({ data }: WaterfallChartProps) {
  const { t } = useTranslation();

  // Convert data for the waterfall logic
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
    <div className="bg-white border border-[#0A0A0A] p-8 w-full h-[500px]">
      <div className="mb-8">
        <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
          {t("dashboard:finance.cash_flow_analysis")}
        </h3>
        <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-2">
          {t("dashboard:finance.cash_flow_analysis_desc")}
        </p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={processedData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
            formatter={(val: any, name: any, props: any) => [`$${props.payload.amount}`, "Amount"]}
            cursor={{ fill: "#FAFAFA" }}
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
          <Bar dataKey="end" stackId="a" fill="transparent" />
          <Bar dataKey="start" stackId="a" barSize={40}>
            {processedData.map((entry, index) => {
              let fill = "#0A0A0A"; 
              if (!entry.isTotal && entry.amount < 0) fill = "#D4D4D8"; 
              if (!entry.isTotal && entry.amount > 0) fill = "#0A0A0A"; 
              if (entry.isTotal) fill = "#0A0A0A";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
