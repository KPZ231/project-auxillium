"use client";

import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface WaterfallItem {
  name: string;
  amount: number;
}

interface CashRunwayWidgetProps {
  waterfallData: WaterfallItem[];
  avgBurnRate: number;
}

export function CashRunwayWidget({ waterfallData, avgBurnRate }: CashRunwayWidgetProps) {
  const { t } = useTranslation();
  
  const endingBalance = waterfallData.find(d => d.name === "Ending")?.amount || 0;
  const totalFunds = Math.max(endingBalance * 6, 25000); 

  const runwayMonths = avgBurnRate > 0 ? totalFunds / avgBurnRate : 999;
  
  let color = "text-[#0A0A0A]"; 
  let icon = <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />;
  let statusKey = "finance.healthy";

  if (runwayMonths < 3) {
    color = "text-[#DC2626]"; 
    icon = <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
    statusKey = "finance.critical";
  } else if (runwayMonths <= 6) {
    color = "text-[#CA8A04]"; 
    icon = <AlertTriangle className="w-5 h-5 text-[#CA8A04]" />;
    statusKey = "finance.warning";
  }

  return (
    <div className="bg-white border border-[#0A0A0A] p-8 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] border border-[#0A0A0A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
              {t("dashboard:finance.financial_safety")}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.estimated_survival")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">
            {t(`dashboard:${statusKey}`)}
          </span>
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <div className={`text-5xl font-black tracking-tighter ${color}`}>
          {runwayMonths === 999 ? "∞" : runwayMonths.toFixed(1)} <span className="text-xl uppercase tracking-widest">{t("dashboard:finance.months")}</span>
        </div>
        <div className="mt-6 pt-6 border-t border-[#F4F4F5]">
          <p className="text-[11px] text-[#71717A] leading-relaxed">
            {t("dashboard:finance.based_on_avg_spending")} <strong className="text-[#0A0A0A]">${avgBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}{t("dashboard:finance.per_month")}</strong>
            <br/>
            {t("dashboard:finance.est_total_funds")}: <strong className="text-[#0A0A0A]">${totalFunds.toLocaleString()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
