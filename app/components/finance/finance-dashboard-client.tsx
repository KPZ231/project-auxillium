"use client";

import React, { useState } from "react";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import { Plus, BarChart3, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { FinanceChart } from "./finance-chart";
import { RevenueGoalCard } from "./revenue-goal-card";
import { ExpenseEstimation } from "./expense-estimation";
import { AddTransactionModal } from "./add-transaction-modal";
import { WaterfallChart } from "./waterfall-chart";
import { CategoryPieChart } from "./category-pie-chart";
import { CashRunwayWidget } from "./cash-runway-widget";
import { AuditLogPanel } from "./audit-log-panel";
import { PnlStatementTable } from "./pnl-statement-table";
import { TransactionHistoryTable } from "./transaction-history-table";
import { getFinancialSummary } from "@/actions/finance";
import { useTranslation } from "@/app/context/TranslationContext";

interface FinanceData {
  months?: { income: number; expenses: number; goal: number }[];
  mom?: { income: number; expenses: number; profitMarginPrev?: number };
  profitMargin?: number;
  waterfallData?: { name: string; amount: number; isTotal?: boolean }[];
  pnlData?: Record<string, { income: number; expense: number }>;
  transactions?: Array<{ id: string; amount: number; date: Date }>,
}

interface FinanceDashboardClientProps {
  initialData: FinanceData;
  userId: string;
  spaceId: string;
}

export function FinanceDashboardClient({ initialData, userId, spaceId }: FinanceDashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const { t } = useTranslation();

  const refreshData = async () => {
    const summary = await getFinancialSummary(spaceId);
    setData(summary);
  };

  const months = data?.months || [];
  const currentGoal = months[months.length - 1]?.goal || 0;
  const currentIncome = months[months.length - 1]?.income || 0;
  
  const incomeMom = data?.mom?.income || 0;
  const expenseMom = data?.mom?.expenses || 0;
  const profitMargin = data?.profitMargin || 0;
  const avgBurnRate = (((data?.months || []).reduce((acc: number, curr: { expenses: number }) => acc + curr.expenses, 0)) / ((data?.months || []).length || 1)) || 0;

  const renderMom = (val: number, inverseGood = false) => {
    if (val === 0) return null;
    const isPositive = val > 0;
    const isGood = inverseGood ? !isPositive : isPositive;
    return (
      <div className={`flex items-center gap-1 text-[11px] font-bold ${isGood ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(val).toFixed(1)}% {t("dashboard:finance.vs_prev_month")}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full pb-20">
      <PageHeader 
        title={t("dashboard:finance.title")} 
        subtitle={t("dashboard:finance.subtitle")}
        primaryAction={{
          label: t("dashboard:finance.add_transaction"),
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
        }}
      />
      
      <div className="p-8 space-y-16">
        {/* EXECUTIVE SUMMARY */}
        <section className="space-y-6">
          <div>
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
              {t("dashboard:finance.executive_summary")}
            </h2>
            <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.executive_summary_desc")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[#E5E5E5] bg-white divide-x divide-[#E5E5E5]">
            <div className="p-8 flex flex-col justify-between h-32">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2">{t("dashboard:finance.income_this_month")}</p>
                <p className="text-3xl font-black text-[#0A0A0A]">${currentIncome.toLocaleString()}</p>
              </div>
              {renderMom(incomeMom, false)}
            </div>
            
            <div className="p-8 flex flex-col justify-between h-32">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2">{t("dashboard:finance.target_revenue")}</p>
                <p className="text-3xl font-black text-[#0A0A0A]">${currentGoal.toLocaleString()}</p>
              </div>
              <div className="text-[11px] font-bold text-[#71717A]">
                {((currentIncome / (currentGoal || 1)) * 100).toFixed(0)}% {t("dashboard:finance.reached")}
              </div>
            </div>
 
            <div className="p-8 flex flex-col justify-between h-32">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2">{t("dashboard:finance.average_spending")}</p>
                <p className="text-3xl font-black text-[#0A0A0A]">
                  ${avgBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              {renderMom(expenseMom, true)}
            </div>
 
            <div className="p-8 flex flex-col justify-between h-32">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2">{t("dashboard:finance.profitability")}</p>
                <p className="text-3xl font-black text-[#0A0A0A]">{profitMargin.toFixed(1)}%</p>
              </div>
              {renderMom(profitMargin - (data?.mom?.profitMarginPrev || 0), false)}
            </div>
          </div>
        </section>
 
        {/* PERFORMANCE ANALYSIS */}
        <section className="space-y-6">
          <div>
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
              {t("dashboard:finance.performance_overview")}
            </h2>
            <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.performance_overview_desc")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FinanceChart data={(data?.months || []) as any} />
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
        </section>
 
        {/* CASH FLOW & SAFETY */}
        <section className="space-y-6">
          <div>
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
              {t("dashboard:finance.cash_flow_analysis")}
            </h2>
            <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.cash_flow_analysis_desc")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <WaterfallChart data={data?.waterfallData || []} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-8">
              <CashRunwayWidget waterfallData={data?.waterfallData || []} avgBurnRate={avgBurnRate} />
              <CategoryPieChart data={data?.pnlData || {}} />
            </div>
          </div>
        </section>
 
        {/* SPENDING INSIGHTS & ACTIVITY */}
        <section className="space-y-6">
          <div>
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
              {t("dashboard:finance.spending_insights")}
            </h2>
            <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.spending_insights_desc")}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExpenseEstimation spaceId={spaceId} />
            <div className="flex flex-col gap-8">
              <div className="bg-white border border-[#0A0A0A] p-8">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                        {t("dashboard:finance.quick_actions")}
                      </h3>
                      <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
                        {t("dashboard:finance.accelerate_management")}
                      </p>
                    </div>
                    <Zap className="w-5 h-5 text-[#0A0A0A]" />
                  </div>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full p-6 bg-[#0A0A0A] text-white hover:bg-white hover:text-[#0A0A0A] border border-[#0A0A0A] transition-all flex items-center justify-between group"
                    >
                      <span className="text-[12px] font-black uppercase tracking-[0.15em]">
                        {t("dashboard:finance.add_transaction")}
                      </span>
                      <Plus className="w-5 h-5" />
                    </button>
                    
                    <div className="p-6 bg-[#FAFAFA] border border-[#E5E5E5]">
                       <p className="text-[11px] text-[#71717A] leading-relaxed">
                         {t("dashboard:finance.data_cache_notice")}
                       </p>
                    </div>
                  </div>
              </div>
 
              <AuditLogPanel spaceId={spaceId} />
            </div>
          </div>
        </section>

        {/* DETAILS TABLE */}
        <section className="space-y-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
                {t("dashboard:finance.summary_table")}
              </h2>
              <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
                {t("dashboard:finance.summary_table_desc")}
              </p>
            </div>
            <PnlStatementTable data={data?.pnlData || {}} />
          </div>

          <div className="space-y-6">
             <div>
              <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#0A0A0A]">
                {t("dashboard:finance.transaction_history") || "Transaction History"}
              </h2>
              <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
                {t("dashboard:finance.transaction_history_desc") || "Review individual incomes and expenses"}
              </p>
            </div>
            <TransactionHistoryTable transactions={(data?.transactions || []) as any} />
          </div>
        </section>
 
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
