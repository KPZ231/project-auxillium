"use client";

import React, { useState } from "react";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import { Plus, BarChart3, TrendingUp, Wallet } from "lucide-react";
import { FinanceChart } from "./finance-chart";
import { RevenueGoalCard } from "./revenue-goal-card";
import { ExpenseEstimation } from "./expense-estimation";
import { AddTransactionModal } from "./add-transaction-modal";
import { getFinancialSummary } from "@/actions/finance";

interface FinanceDashboardClientProps {
  initialData: any;
  userId: string;
  spaceId: string;
}

export function FinanceDashboardClient({ initialData, userId, spaceId }: FinanceDashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const refreshData = async () => {
    const summary = await getFinancialSummary(spaceId);
    setData(summary);
  };

  const currentGoal = data?.months?.[data.months.length - 1]?.goal || 0;
  const currentIncome = data?.months?.[data.months.length - 1]?.income || 0;

  return (
    <div className="flex flex-col w-full pb-20">
      <PageHeader 
        title="Financial Control" 
        subtitle="Manage your business cashflow, expenses, and revenue goals."
        primaryAction={{
          label: "ADD TRANSACTION",
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
        }}
      />
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E5E5E5] p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-[#FAFAFA] flex items-center justify-center border border-[#D4D4D8]">
              <Wallet className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Total Income (MTD)</p>
              <p className="text-2xl font-black text-[#0A0A0A]">${currentIncome.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white border border-[#E5E5E5] p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-[#FAFAFA] flex items-center justify-center border border-[#D4D4D8]">
              <TrendingUp className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Revenue Goal</p>
              <p className="text-2xl font-black text-[#0A0A0A]">${currentGoal.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-[#FAFAFA] flex items-center justify-center border border-[#D4D4D8]">
              <BarChart3 className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Burn Rate (Avg)</p>
              <p className="text-2xl font-black text-[#0A0A0A]">
                ${(data?.months?.reduce((acc: number, curr: any) => acc + curr.expenses, 0) / (data?.months?.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FinanceChart data={data?.months || []} />
          </div>
          <div className="lg:col-span-1">
            <RevenueGoalCard 
              currentGoal={currentGoal} 
              currentIncome={currentIncome} 
              spaceId={spaceId} 
              userId={userId} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseEstimation spaceId={spaceId} />
          
          <div className="bg-white border border-[#E5E5E5] p-8">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                    Quick Actions
                  </h3>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
                    Financial Management
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full p-6 border border-[#D4D4D8] hover:border-[#0A0A0A] transition-all flex items-center justify-between group"
                >
                  <span className="text-[12px] font-black uppercase tracking-[0.15em] text-[#71717A] group-hover:text-[#0A0A0A]">
                    Add New Transaction
                  </span>
                  <Plus className="w-5 h-5 text-[#D4D4D8] group-hover:text-[#0A0A0A]" />
                </button>
                
                <div className="p-6 bg-[#FAFAFA] border border-[#D4D4D8]">
                   <p className="text-[11px] text-[#71717A] leading-relaxed">
                     Your financial data is automatically cached for high performance. 
                     New transactions will invalidate the cache and update the dashboard in real-time.
                   </p>
                </div>
              </div>
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          refreshData();
        }} 
        spaceId={spaceId} 
        userId={userId} 
      />
    </div>
  );
}
