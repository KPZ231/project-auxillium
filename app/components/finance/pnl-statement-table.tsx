"use client";

import React from "react";
import { Download, FileText } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface PnlStatementTableProps {
  data: Record<string, { income: number; expense: number }>;
}

export function PnlStatementTable({ data }: PnlStatementTableProps) {
  const { t } = useTranslation();
  const categories = Object.keys(data);
  let totalIncome = 0;
  let totalExpense = 0;

  categories.forEach(cat => {
    totalIncome += data[cat].income;
    totalExpense += data[cat].expense;
  });

  const netProfit = totalIncome - totalExpense;

  const exportToCsv = () => {
    const headers = [t("dashboard:finance.category"), t("dashboard:finance.incomes"), t("dashboard:finance.expenses"), "Net"];
    const rows = categories.map(cat => [
      cat,
      data[cat].income.toFixed(2),
      data[cat].expense.toFixed(2),
      (data[cat].income - data[cat].expense).toFixed(2)
    ]);
    
    rows.push(["TOTAL", totalIncome.toFixed(2), totalExpense.toFixed(2), netProfit.toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#0A0A0A] w-full">
      <div className="p-8 border-b border-[#0A0A0A] flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0A0A0A] flex items-center justify-center text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
              {t("dashboard:finance.summary_table")}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.summary_table_desc")}
            </p>
          </div>
        </div>
        <button 
          onClick={exportToCsv}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] border-b-2 border-[#0A0A0A] pb-1 hover:text-[#71717A] hover:border-[#71717A] transition-all"
        >
          <Download className="w-3 h-3" />
          <span>{t("dashboard:metrics.generate_report")}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#0A0A0A]">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">{t("dashboard:finance.category")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">{t("dashboard:finance.incomes")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">{t("dashboard:finance.expenses")}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat} className="border-b border-[#F4F4F5] hover:bg-[#FAFAFA] transition-colors">
                <td className="p-6 text-[13px] font-bold text-[#0A0A0A] uppercase tracking-tight">{cat}</td>
                <td className="p-6 text-[13px] text-[#0A0A0A] text-right font-mono font-bold">${data[cat].income.toLocaleString()}</td>
                <td className="p-6 text-[13px] text-[#71717A] text-right font-mono font-bold">-${data[cat].expense.toLocaleString()}</td>
                <td className={`p-6 text-[13px] text-right font-mono font-black ${data[cat].income - data[cat].expense >= 0 ? "text-[#0A0A0A]" : "text-[#DC2626]"}`}>
                  ${(data[cat].income - data[cat].expense).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-[#FAFAFA] border-t border-[#0A0A0A]">
              <td className="p-6 text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">Total</td>
              <td className="p-6 text-[15px] font-black text-[#0A0A0A] text-right font-mono">${totalIncome.toLocaleString()}</td>
              <td className="p-6 text-[15px] font-black text-[#71717A] text-right font-mono">-${totalExpense.toLocaleString()}</td>
              <td className={`p-6 text-[15px] font-black text-right font-mono ${netProfit >= 0 ? "text-[#0A0A0A]" : "text-[#DC2626]"}`}>
                ${netProfit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
