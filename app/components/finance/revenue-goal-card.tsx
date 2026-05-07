"use client";

import React, { useState } from "react";
import { PremiumInput } from "@/app/components/UI/FormElements";
import { toast } from "sonner";
import { setRevenueGoal } from "@/actions/finance";

interface RevenueGoalCardProps {
  currentGoal: number;
  currentIncome: number;
  spaceId: string;
  userId: string;
}

export const RevenueGoalCard = ({ currentGoal, currentIncome, spaceId, userId }: RevenueGoalCardProps) => {
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
      toast.success("Goal updated");
      setIsEditing(false);
    } else {
      toast.error(res.error || "Failed to update goal");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
            Revenue Goal
          </h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
            Monthly Target Progress
          </p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-black uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A] transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Goal"}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6 grow">
          <PremiumInput
            label="Monthly Goal Amount"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-[#0A0A0A] text-white hover:bg-black/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Goal"}
          </button>
        </div>
      ) : (
        <div className="space-y-8 grow flex flex-col justify-center">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[32px] font-black text-[#0A0A0A]">
                {percentage.toFixed(0)}%
              </p>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">
                Reached
              </p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#0A0A0A]">
                ${currentIncome.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">
                of ${currentGoal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full h-4 bg-[#F4F4F5]">
            <div 
              className="h-full bg-[#0A0A0A] transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-[10px] text-[#71717A] italic text-center">
            {currentGoal - currentIncome > 0 
              ? `$${(currentGoal - currentIncome).toLocaleString()} more to hit your goal`
              : "Goal reached! Excellent performance."}
          </p>
        </div>
      )}
    </div>
  );
};
