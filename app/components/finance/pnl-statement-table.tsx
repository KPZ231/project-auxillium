"use client";

import React from "react";
import { Download } from "lucide-react";

interface PnlStatementTableProps {
  data: Record<string, { income: number; expense: number }>;
}

export function PnlStatementTable({ data }: PnlStatementTableProps) {
  const categories = Object.keys(data);
  let totalIncome = 0;
  let totalExpense = 0;

  categories.forEach(cat => {
    totalIncome += data[cat].income;
    totalExpense += data[cat].expense;
  });

  const netProfit = totalIncome - totalExpense;

  const exportToCsv = () => {
    const headers = ["Category", "Income", "Expense", "Net"];
    const rows = categories.map(cat => [
      cat,
      data[cat].income.toFixed(2),
      data[cat].expense.toFixed(2),
      (data[cat].income - data[cat].expense).toFixed(2)
    ]);
    
    // Add totals row
    rows.push(["TOTAL", totalIncome.toFixed(2), totalExpense.toFixed(2), netProfit.toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pnl_statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] w-full mt-8">
      <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center bg-[#FAFAFA]">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">P&L Statement</h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">Current Month</p>
        </div>
        <button 
          onClick={exportToCsv}
          className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] border border-[#0A0A0A] px-4 py-2 hover:bg-[#0A0A0A] hover:text-[#FAFAFA] transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5]">
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Category</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">Income</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">Expense</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat} className="border-b border-[#F4F4F5] hover:bg-[#FAFAFA] transition-colors">
                <td className="p-4 text-[13px] font-medium text-[#0A0A0A]">{cat}</td>
                <td className="p-4 text-[13px] text-[#0A0A0A] text-right font-mono">${data[cat].income.toLocaleString()}</td>
                <td className="p-4 text-[13px] text-[#DC2626] text-right font-mono">-${data[cat].expense.toLocaleString()}</td>
                <td className={`p-4 text-[13px] text-right font-mono font-bold ${data[cat].income - data[cat].expense >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  ${(data[cat].income - data[cat].expense).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-[#FAFAFA] border-t-2 border-[#0A0A0A]">
              <td className="p-4 text-[12px] font-black uppercase tracking-wider text-[#0A0A0A]">Total</td>
              <td className="p-4 text-[14px] font-black text-[#0A0A0A] text-right font-mono">${totalIncome.toLocaleString()}</td>
              <td className="p-4 text-[14px] font-black text-[#DC2626] text-right font-mono">-${totalExpense.toLocaleString()}</td>
              <td className={`p-4 text-[14px] font-black text-right font-mono ${netProfit >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                ${netProfit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
