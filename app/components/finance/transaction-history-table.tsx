"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, FileText, Search, Calendar } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";
import { TransactionDetailModal } from "./transaction-detail-modal";

interface Transaction {
  id: string;
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

interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState("");

  const filteredTransactions = transactions.filter(tx => 
    (tx.description?.toLowerCase().includes(filter.toLowerCase())) ||
    (tx.category?.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="bg-white border border-[#0A0A0A] w-full">
      <div className="p-8 border-b border-[#0A0A0A] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0A0A0A] flex items-center justify-center text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
              {t("dashboard:finance.transaction_history") || "Transaction History"}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.transaction_history_desc") || "Review individual incomes and expenses"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input 
              type="text" 
              placeholder={t("dashboard:common.search")}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E5E5E5] text-[12px] focus:border-[#0A0A0A] outline-none w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#0A0A0A]">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">{t("dashboard:finance.date")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">{t("dashboard:finance.description")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">{t("dashboard:finance.category")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">{t("dashboard:finance.amount")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-center">Attachment</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === "EXPENSE";
                const date = new Date(tx.date).toLocaleDateString();
                
                return (
                  <tr 
                    key={`${tx.type}-${tx.id}`} 
                    onClick={() => setSelectedTransaction(tx)}
                    className="border-b border-[#F4F4F5] hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                  >
                    <td className="p-6 text-[12px] font-medium text-[#71717A]">{date}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${isExpense ? "bg-[#DC2626]/10 text-[#DC2626]" : "bg-[#16A34A]/10 text-[#16A34A]"}`}>
                          {isExpense ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        </div>
                        <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-tight group-hover:underline underline-offset-4 decoration-2">
                          {tx.description || (isExpense ? "Expense" : "Income")}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-2 py-1 bg-[#FAFAFA] border border-[#E5E5E5] text-[10px] font-black uppercase tracking-widest text-[#71717A]">
                        {tx.category || "General"}
                      </span>
                    </td>
                    <td className={`p-6 text-[14px] text-right font-mono font-black ${isExpense ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                      {isExpense ? "-" : "+"}${tx.amount.toLocaleString()}
                    </td>
                    <td className="p-6 text-center">
                      {tx.receiptUrl ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-[#0A0A0A] text-white">
                          <FileText className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#D4D4D8] font-bold uppercase tracking-widest">None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#D4D4D8]">No transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TransactionDetailModal 
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
