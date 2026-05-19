"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumInput, PremiumSelect, PremiumTextarea } from "@/app/components/UI/FormElements";
import { toast } from "sonner";
import { addExpense, addIncome, getLabels, checkAnomaly, getFinanceEntities } from "@/actions/finance";
import { uploadReceipt } from "@/actions/uploadReceipt";
import { X, AlertTriangle, UploadCloud } from "lucide-react";
import { TransactionCategory } from "@/lib/generated/client/client";

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
    currency: "USD",
    description: "",
    category: "" as TransactionCategory | "",
    isRecurring: false,
    cycle: "monthly",
    recurringDay: "1",
    source: "",
    entityId: "", // Combined clientId or projectId
    labelIds: [] as string[],
  });
  const [labels, setLabels] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ clients: { id: string; name: string; type: string }[]; projects: { id: string; name: string; type: string }[] }>({ clients: [], projects: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Anomaly state
  const [anomalyWarning, setAnomalyWarning] = useState(false);
  const anomalyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    const [fetchedLabels, fetchedEntities] = await Promise.all([
      getLabels(spaceId, type),
      getFinanceEntities(spaceId)
    ]);
    setLabels(fetchedLabels);
    setEntities(fetchedEntities);
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, type, spaceId]);

  // Debounced anomaly check
  useEffect(() => {
    if (type === "EXPENSE" && formData.category && formData.amount) {
      const amountNum = parseFloat(formData.amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        if (anomalyTimeoutRef.current) clearTimeout(anomalyTimeoutRef.current);
        anomalyTimeoutRef.current = setTimeout(async () => {
          const isAnomaly = await checkAnomaly(spaceId, formData.category as TransactionCategory, amountNum, formData.currency);
          setAnomalyWarning(isAnomaly);
        }, 500);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnomalyWarning(false);
    }
    return () => {
      if (anomalyTimeoutRef.current) clearTimeout(anomalyTimeoutRef.current);
    };
  }, [formData.amount, formData.category, formData.currency, type, spaceId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      setIsSubmitting(false);
      return;
    }

    if (!formData.entityId) {
      toast.error("Please select a Client or Project");
      setIsSubmitting(false);
      return;
    }

    try {
      let receiptUrl = undefined;
      if (file) {
        const fileData = new FormData();
        fileData.append("file", file);
        const uploadRes = await uploadReceipt(fileData);
        if (uploadRes.success && uploadRes.url) {
          receiptUrl = uploadRes.url;
        } else {
          toast.error("Failed to upload receipt, proceeding without it.");
        }
      }

      // Determine if entityId is project or client
      const selectedEntity = [...entities.clients, ...entities.projects].find(e => e.id === formData.entityId);
      const clientId = selectedEntity?.type === 'CLIENT' ? selectedEntity.id : undefined;
      const projectId = selectedEntity?.type === 'PROJECT' ? selectedEntity.id : undefined;

      if (type === "EXPENSE") {
        const res = await addExpense({
          amount,
          currency: formData.currency,
          description: formData.description,
          category: formData.category as TransactionCategory,
          isRecurring: formData.isRecurring,
          cycle: formData.isRecurring ? formData.cycle : undefined,
          recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
          receiptUrl,
          spaceId,
          userId,
          labelIds: formData.labelIds,
          clientId,
          projectId,
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
          currency: formData.currency,
          description: formData.description,
          source: selectedEntity?.name || formData.source,
          category: formData.category as TransactionCategory,
          isRecurring: formData.isRecurring,
          cycle: formData.isRecurring ? formData.cycle : undefined,
          recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
          receiptUrl,
          spaceId,
          userId,
          labelIds: formData.labelIds,
          clientId,
          projectId,
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

  const entityOptions = [
    { value: "", label: "Select Client or Project" },
    ...entities.clients.map(c => ({ value: c.id, label: `[CLIENT] ${c.name}` })),
    ...entities.projects.map(p => ({ value: p.id, label: `[PROJECT] ${p.name}` }))
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
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
          className="relative w-full h-full md:h-auto max-w-full md:max-w-2xl bg-[#FAFAFA] border-0 md:border md:border-[#0A0A0A] shadow-2xl p-6 md:p-8 max-h-screen md:max-h-[90vh] overflow-y-auto"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PremiumInput
                label="Amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
              <PremiumSelect
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "PLN", label: "PLN (zł)" },
                ]}
              />
            </div>
            
            {anomalyWarning && (
              <div className="bg-[#FEF2F2] border border-[#DC2626] p-4 flex gap-4 items-start">
                <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
                <div>
                  <h4 className="text-[12px] font-bold text-[#DC2626] uppercase tracking-wider">Anomaly Detected</h4>
                  <p className="text-[11px] text-[#DC2626] mt-1">This amount is more than 2x the historical average for this category.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PremiumSelect
                label="Link to (Client or Project)"
                required
                value={formData.entityId}
                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                options={entityOptions}
              />
              {type === "EXPENSE" ? (
                <PremiumSelect
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory | "" })}
                  options={[
                    { value: "", label: "Select Category" },
                    { value: "Marketing", label: "Marketing" },
                    { value: "SaaS", label: "SaaS" },
                    { value: "Taxes", label: "Taxes" },
                    { value: "Salary", label: "Salary" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              ) : (
                <PremiumSelect
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory | "" })}
                  options={[
                    { value: "", label: "Select Category" },
                    { value: "Revenue", label: "Revenue" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              )}
            </div>

            <PremiumTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide more context..."
              rows={2}
            />

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
                  Recurring Transaction
                </label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <PremiumInput
                    label="Recurring Day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringDay}
                    onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                    placeholder="e.g. 15"
                  />
                </div>
              )}
            </div>

            {/* Drag and drop for receipt */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A] mb-2">
                Attachment (Receipt / Invoice)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragging ? "border-[#0A0A0A] bg-[#FAFAFA]" : "border-[#E5E5E5] hover:border-[#A1A1AA]"
                }`}
              >
                <input
                  type="file"
                  id="receipt-upload"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="receipt-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-[#A1A1AA] mb-4" />
                  <p className="text-[12px] font-bold text-[#0A0A0A]">
                    {file ? file.name : "Drag & drop a file here, or click to select"}
                  </p>
                  <p className="text-[10px] text-[#71717A] mt-2 uppercase tracking-widest">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </label>
              </div>
            </div>

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
