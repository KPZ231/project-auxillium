"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";

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
  return (
    <div className="w-full h-[400px] bg-white border border-[#E5E5E5] p-6">
      <div className="mb-6">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
          Financial Overview
        </h3>
        <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
          Last 6 Months: Income vs Expenses
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip 
            cursor={{ fill: '#FAFAFA' }}
            contentStyle={{ 
              borderRadius: '0px', 
              border: '1px solid #0A0A0A',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="square"
            wrapperStyle={{ 
              paddingBottom: '20px', 
              fontSize: '10px', 
              fontWeight: 900, 
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill="#0A0A0A" 
            barSize={30} 
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses" 
            fill="#D4D4D8" 
            barSize={30} 
          />
          <Line 
            type="monotone" 
            dataKey="goal" 
            name="Revenue Goal" 
            stroke="#0A0A0A" 
            strokeWidth={2} 
            dot={{ r: 4, fill: '#0A0A0A', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
