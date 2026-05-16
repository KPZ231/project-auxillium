"use client";

import React from "react";
import Image from "next/image";
import { X, Calendar, DollarSign, Tag, FileText, User, Briefcase, ExternalLink, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface Transaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
  description?: string;
  category?: string;
  receiptUrl?: string;
  clientId?: string;
  projectId?: string;
  isRecurring?: boolean;
  currency?: string;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !transaction) return null;

  const isExpense = transaction.type === "EXPENSE";
  const date = new Date(transaction.date).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#0A0A0A] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[#F4F4F5] transition-colors"
        >
          <X className="w-5 h-5 text-[#0A0A0A]" />
        </button>

        <div className="p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className={`w-16 h-16 flex items-center justify-center text-white ${isExpense ? "bg-[#DC2626]" : "bg-[#16A34A]"}`}>
              {isExpense ? <ArrowDownRight className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-[24px] font-black uppercase tracking-tighter text-[#0A0A0A]">
                {transaction.description || (isExpense ? t("dashboard:finance.expense") : t("dashboard:finance.income"))}
              </h2>
              <p className="text-[12px] text-[#71717A] uppercase tracking-widest mt-1">
                {isExpense ? t("dashboard:finance.expense_details") : t("dashboard:finance.income_details")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> {t("dashboard:finance.amount")}
                </p>
                <p className="text-3xl font-black text-[#0A0A0A]">
                  {isExpense ? "-" : "+"}{transaction.amount.toLocaleString()} {transaction.currency}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {t("dashboard:finance.date")}
                </p>
                <p className="text-lg font-bold text-[#0A0A0A]">{date}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                  <Tag className="w-3 h-3" /> {t("dashboard:finance.category")}
                </p>
                <div className="inline-block px-3 py-1 border border-[#0A0A0A] text-[11px] font-black uppercase tracking-widest">
                  {transaction.category || "Uncategorized"}
                </div>
              </div>
            </div>

            <div className="space-y-8">
               {transaction.clientId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> {t("dashboard:clients.client")}
                  </p>
                  <p className="text-lg font-bold text-[#0A0A0A]">{transaction.clientId}</p>
                </div>
              )}

              {transaction.projectId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> {t("dashboard:projects.title")}
                  </p>
                  <p className="text-lg font-bold text-[#0A0A0A]">{transaction.projectId}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> {t("dashboard:finance.type")}
                </p>
                <p className="text-lg font-bold text-[#0A0A0A]">
                  {transaction.isRecurring ? t("dashboard:finance.recurring") : t("dashboard:finance.one_time")}
                </p>
              </div>
            </div>
          </div>

          {transaction.receiptUrl && (
            <div className="pt-12 border-t border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] flex items-center gap-2">
                  <FileText className="w-3 h-3" /> {t("dashboard:finance.receipt_invoice")}
                </p>
                <div className="flex gap-4">
                  <a 
                    href={transaction.receiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] border-b border-[#0A0A0A] hover:text-[#71717A] hover:border-[#71717A] transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Full</span>
                  </a>
                </div>
              </div>
              
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] overflow-hidden group relative">
                <Image
                  src={transaction.receiptUrl}
                  alt="Receipt"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            </div>
          )}

          {!transaction.receiptUrl && (
             <div className="pt-12 border-t border-[#E5E5E5]">
                <div className="p-12 border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center text-[#71717A]">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-[12px] font-bold uppercase tracking-widest">No receipt attached</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
