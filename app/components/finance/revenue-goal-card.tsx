"use client";

import React, { useState } from "react";
import { PremiumInput } from "@/app/components/UI/FormElements";
import { toast } from "sonner";
import { setRevenueGoal } from "@/actions/finance";
import { useTranslation } from "@/app/context/TranslationContext";
import { Target, TrendingUp } from "lucide-react";

interface RevenueGoalCardProps {
  currentGoal: number;
  currentIncome: number;
  spaceId: string;
  userId: string;
}

export const RevenueGoalCard = ({ currentGoal, currentIncome, spaceId, userId }: RevenueGoalCardProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(currentGoal.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percentage = currentGoal > 0 ? Math.min(100, (currentIncome / currentGoal) * 100) : 0;

  const handleSave = async () => {
    setIsSubmitting(true);
    const amount = parseFloat(goal);
    if (isNaN(amount)) {
      toast.error("Invalid amount");
      setIsSubmitting(false);
      return;
    }

    const now = new Date();
    const res = await setRevenueGoal({
      amount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      spaceId,
      userId,
    });

    if (res.success) {
      toast.success(t("dashboard:finance.goal_updated") || "Goal updated");
      setIsEditing(false);
    } else {
      toast.error(res.error || "Failed to update goal");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border border-[#0A0A0A] p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAFAFA] border border-[#0A0A0A] flex items-center justify-center">
            <Target className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
              {t("dashboard:finance.target_revenue")}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.monthly_target_progress")}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-black uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A] border-b border-transparent hover:border-[#0A0A0A] transition-all"
        >
          {isEditing ? t("dashboard:finance.cancel") : t("dashboard:finance.edit_goal")}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6 grow">
          <PremiumInput
            label={t("dashboard:finance.monthly_goal_amount")}
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] bg-[#0A0A0A] text-white hover:bg-white hover:text-[#0A0A0A] border border-[#0A0A0A] transition-all disabled:opacity-50"
          >
            {isSubmitting ? t("dashboard:finance.saving") : t("dashboard:finance.save_goal")}
          </button>
        </div>
      ) : (
        <div className="space-y-8 grow flex flex-col justify-center">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[40px] font-black text-[#0A0A0A] leading-none tracking-tighter">
                {percentage.toFixed(0)}%
              </p>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-2">
                {t("dashboard:finance.reached")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-black text-[#0A0A0A]">
                ${currentIncome.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">
                {t("dashboard:finance.of")} ${currentGoal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full h-2 bg-[#F4F4F5] overflow-hidden">
            <div 
              className="h-full bg-[#0A0A0A] transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            <TrendingUp className="w-3 h-3 text-[#71717A]" />
            <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-tight">
              {currentGoal - currentIncome > 0 
                ? `$${(currentGoal - currentIncome).toLocaleString()} ${t("dashboard:finance.more_to_hit_goal")}`
                : t("dashboard:finance.goal_reached")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
