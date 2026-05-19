"use client";

import React, { useState, useEffect } from "react";
import { estimateFutureExpenses } from "@/actions/finance";
import { PremiumSelect } from "@/app/components/UI/FormElements";
import { useTranslation } from "@/app/context/TranslationContext";
import { BrainCircuit } from "lucide-react";

interface ExpenseEstimationProps {
  spaceId: string;
}

export const ExpenseEstimation = ({ spaceId }: ExpenseEstimationProps) => {
  const { t } = useTranslation();
  const [months, setMonths] = useState("3");
  const [estimation, setEstimation] = useState<{
    estimatedPerMonth: number;
    totalForPeriod: number;
    recurringTotal: number;
    recurringExpenses?: { recurringDay: number | null; amount: number; category?: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimation = async () => {
    setIsLoading(true);
    const res = await estimateFutureExpenses(spaceId, parseInt(months));
    setEstimation(res as any);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEstimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, months]);

  return (
    <div className="bg-white border border-[#0A0A0A] p-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] border border-[#0A0A0A] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
              {t("dashboard:finance.expense_estimation")}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.expense_estimation_desc")}
            </p>
          </div>
        </div>
        
        <div className="w-24">
          <PremiumSelect
            label="Period"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            options={[
              { value: "3", label: "3M" },
              { value: "6", label: "6M" },
              { value: "12", label: "12M" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-50 border border-[#E5E5E5]" />
          <div className="h-32 bg-gray-50 border border-[#E5E5E5]" />
        </div>
      ) : estimation ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-[#FAFAFA] border border-[#0A0A0A]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#71717A]">
                {t("dashboard:finance.est_monthly")}
              </p>
              <p className="text-[24px] font-black text-[#0A0A0A] mt-2 tracking-tighter">
                ${estimation.estimatedPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-6 bg-white border border-[#0A0A0A]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#71717A]">
                {t("dashboard:finance.recurring_total")}
              </p>
              <p className="text-[24px] font-black text-[#0A0A0A] mt-2 tracking-tighter">
                ${estimation.recurringTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="relative group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-4">
              {t("dashboard:finance.total_predicted_for")} {months} {t("dashboard:finance.months")}
            </p>
            <div className="p-6 sm:p-10 bg-[#0A0A0A] text-white flex justify-between items-center transition-transform hover:scale-[1.01] duration-300">
              <span className="text-[40px] font-black tracking-tighter">
                ${estimation.totalForPeriod.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 rotate-90">
                {t("dashboard:finance.forecast")}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#71717A] leading-relaxed uppercase font-bold tracking-tight">
            {t("dashboard:finance.estimation_disclaimer")}
          </p>

          {estimation.recurringExpenses && estimation.recurringExpenses.length > 0 && (
            <div className="pt-8 border-t border-[#0A0A0A]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] mb-4">
                {t("dashboard:finance.upcoming_recurring")}
              </p>
              <ul className="space-y-2">
                {estimation.recurringExpenses
                  .filter(e => {
                    if (!e.recurringDay) return false;
                    const today = new Date().getDate();
                    const diff = e.recurringDay - today;
                    return diff >= 0 && diff <= 7;
                  })
                  .map((exp, idx) => (
                    <li key={idx} className="flex justify-between items-center text-[11px] bg-white p-4 border border-[#F4F4F5] hover:border-[#0A0A0A] transition-colors">
                      <div className="flex flex-col">
                        <span className="font-black text-[#0A0A0A] uppercase tracking-tight">{exp.category || 'Expense'}</span>
                        <span className="text-[9px] text-[#71717A] uppercase font-bold">Scheduled: Day {exp.recurringDay}</span>
                      </div>
                      <span className="font-mono font-black text-[#0A0A0A]">-${exp.amount.toFixed(2)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-[#71717A] text-[11px] uppercase tracking-widest border border-dashed border-[#D4D4D8]">
          {t("dashboard:finance.insufficient_data")}
        </div>
      )}
    </div>
  );
};
