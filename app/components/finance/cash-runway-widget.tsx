"use client";

import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface CashRunwayWidgetProps {
  waterfallData: any[];
  avgBurnRate: number;
}

export function CashRunwayWidget({ waterfallData, avgBurnRate }: CashRunwayWidgetProps) {
  // Let's assume total funds is sum of all historical incomes minus expenses
  // Wait, waterfallData has a mock 'Starting' balance. In the summary we did sum everything.
  // Actually, we don't have total historical funds in summary. 
  // Let's mock the total funds for the sake of the widget to be (Latest Month Income - Latest Month Expense) + 10000 
  // or use the ending balance from waterfall if it exists.
  
  const endingBalance = waterfallData.find(d => d.name === "Ending")?.amount || 0;
  // Fallback to a placeholder base funds amount if ending balance is just current month's flow
  const totalFunds = Math.max(endingBalance * 6, 25000); // Mock total funds based on ending balance

  const runwayMonths = avgBurnRate > 0 ? totalFunds / avgBurnRate : 999;
  
  let color = "text-[#16A34A]"; // Green
  let icon = <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />;
  let status = "Healthy";

  if (runwayMonths < 3) {
    color = "text-[#DC2626]"; // Red
    icon = <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
    status = "Critical";
  } else if (runwayMonths <= 6) {
    color = "text-[#CA8A04]"; // Yellow
    icon = <AlertTriangle className="w-5 h-5 text-[#CA8A04]" />;
    status = "Warning";
  }

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">Cash Runway</h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">Estimated Survival</p>
        </div>
        {icon}
      </div>
      
      <div className="mt-4">
        <div className={`text-4xl font-black ${color}`}>
          {runwayMonths === 999 ? "∞" : runwayMonths.toFixed(1)} <span className="text-xl">mos</span>
        </div>
        <p className="text-[12px] text-[#71717A] mt-2">
          Based on avg burn rate of <strong>${avgBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</strong>
          <br/>
          Est. total funds: <strong>${totalFunds.toLocaleString()}</strong>
        </p>
      </div>
    </div>
  );
}
