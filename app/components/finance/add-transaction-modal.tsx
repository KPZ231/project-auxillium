"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumInput, PremiumSelect, PremiumTextarea } from "@/app/components/UI/FormElements";
import { toast } from "sonner";
import { addExpense, addIncome, createLabel, getLabels } from "@/actions/finance";
import { X, Plus } from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  userId: string;
}

export const AddTransactionModal = ({ isOpen, onClose, spaceId, userId }: AddTransactionModalProps) => {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    isRecurring: false,
    cycle: "monthly",
    source: "",
    labelIds: [] as string[],
  });
  const [labels, setLabels] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLabels = async () => {
    const fetched = await getLabels(spaceId, type);
    setLabels(fetched);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      setIsSubmitting(false);
      return;
    }

    try {
      if (type === "EXPENSE") {
        const res = await addExpense({
          amount,
          description: formData.description,
          category: formData.category,
          isRecurring: formData.isRecurring,
          cycle: formData.isRecurring ? formData.cycle : undefined,
          spaceId,
          userId,
          labelIds: formData.labelIds,
          date: new Date(),
        });
        if (res.success) {
          toast.success("Expense added successfully");
          onClose();
        } else {
          toast.error(res.error || "Failed to add expense");
        }
      } else {
        const res = await addIncome({
          amount,
          description: formData.description,
          source: formData.source,
          spaceId,
          userId,
          labelIds: formData.labelIds,
          date: new Date(),
        });
        if (res.success) {
          toast.success("Income added successfully");
          onClose();
        } else {
          toast.error(res.error || "Failed to add income");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[#FAFAFA] border border-[#0A0A0A] shadow-2xl p-8"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                Add Transaction
              </h2>
              <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
                Record a new financial entry
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-1 mb-8 border-b border-[#E5E5E5]">
            <button
              onClick={() => setType("EXPENSE")}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                type === "EXPENSE" 
                ? "bg-[#0A0A0A] text-white" 
                : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setType("INCOME")}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                type === "INCOME" 
                ? "bg-[#0A0A0A] text-white" 
                : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <PremiumInput
                label="Amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
              
              {type === "EXPENSE" ? (
                <PremiumSelect
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: "", label: "Select Category" },
                    { value: "subscription", label: "Subscription" },
                    { value: "tax", label: "Taxes" },
                    { value: "salary", label: "Salary" },
                    { value: "marketing", label: "Marketing" },
                    { value: "office", label: "Office" },
                    { value: "other", label: "Other" },
                  ]}
                />
              ) : (
                <PremiumInput
                  label="Source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Project Name, Client, etc."
                />
              )}
            </div>

            <PremiumTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more context..."
              rows={3}
            />

            {type === "EXPENSE" && (
              <div className="p-6 bg-white border border-[#E5E5E5] space-y-6">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 border-[#D4D4D8] rounded-none text-[#0A0A0A] focus:ring-[#0A0A0A]"
                  />
                  <label htmlFor="isRecurring" className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">
                    Recurring Expense
                  </label>
                </div>

                {formData.isRecurring && (
                  <PremiumSelect
                    label="Billing Cycle"
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    options={[
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly" },
                      { value: "quarterly", label: "Quarterly" },
                    ]}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-[#E5E5E5]">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] border border-[#0A0A0A] hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-[#0A0A0A] text-white hover:bg-black/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
