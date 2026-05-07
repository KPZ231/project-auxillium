"use client";

import React, { useState, useEffect } from "react";
import { estimateFutureExpenses } from "@/actions/finance";
import { PremiumSelect } from "@/app/components/UI/FormElements";

interface ExpenseEstimationProps {
  spaceId: string;
}

export const ExpenseEstimation = ({ spaceId }: ExpenseEstimationProps) => {
  const [months, setMonths] = useState("3");
  const [estimation, setEstimation] = useState<{
    estimatedPerMonth: number;
    totalForPeriod: number;
    recurringTotal: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEstimation();
  }, [spaceId, months]);

  const fetchEstimation = async () => {
    setIsLoading(true);
    const res = await estimateFutureExpenses(spaceId, parseInt(months));
    setEstimation(res);
    setIsLoading(false);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] p-8 h-full">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
            Expense Estimation
          </h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
            Predictive Cost Analysis
          </p>
        </div>
        
        <div className="w-24">
          <PremiumSelect
            label="Months"
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
          <div className="h-12 bg-gray-100" />
          <div className="h-24 bg-gray-50" />
        </div>
      ) : estimation ? (
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-[#FAFAFA] border-l-4 border-[#0A0A0A]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#71717A]">
                Est. Monthly
              </p>
              <p className="text-[20px] font-black text-[#0A0A0A] mt-2">
                ${estimation.estimatedPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-6 bg-[#FAFAFA] border-l-4 border-[#D4D4D8]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#71717A]">
                Recurring Total
              </p>
              <p className="text-[20px] font-black text-[#0A0A0A] mt-2">
                ${estimation.recurringTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-4">
              Total Predicted for {months} Months
            </p>
            <div className="p-8 bg-[#0A0A0A] text-white flex justify-between items-center">
              <span className="text-[32px] font-black">
                ${estimation.totalForPeriod.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 rotate-90">
                FORECAST
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[#71717A] italic leading-relaxed">
            * Estimation is based on current recurring cycles and historical one-time averages. Actual costs may vary.
          </p>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-[#71717A] text-[11px] uppercase tracking-widest border border-dashed">
          Insufficient data for estimation
        </div>
      )}
    </div>
  );
};
