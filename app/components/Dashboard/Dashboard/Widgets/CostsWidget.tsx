"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import { getFinancialSummary } from "@/actions/finance";
import { getActiveSpaceId } from "@/actions/space";
import LoadingCircle from "@/app/components/UI/LoadingCircle";
import { useTranslation } from "@/app/context/TranslationContext";
import { Receipt, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function CostsWidget() {
  const { t, language } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      setLoading(true);
      try {
        const spaceId = await getActiveSpaceId();
        if (spaceId) {
          const result = await getFinancialSummary(spaceId) as { transactions?: any[] };
          if (result && result.transactions) {
            // Get recent expenses
            const expenses = result.transactions.filter(t => t.type === 'EXPENSE').slice(0, 3);
            setTransactions(expenses);
          }
        }
      } catch (err) {
        console.error("Error fetching finance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white border border-gray-300 flex flex-col h-[300px] overflow-hidden"
    >
      <div className="bg-[#e5e5e5] p-6 flex justify-between items-center border-b border-gray-300 shrink-0">
        <h3 className="text-sm font-bold text-black tracking-widest uppercase flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          {t("dashboard:widgets.recent_costs", "Recent Costs")}
        </h3>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {loading ? (
          <div className="grow flex items-center justify-center">
            <LoadingCircle size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="grow flex items-center justify-center text-xs font-medium text-gray-400">
            {t("dashboard:widgets.no_costs", "No recent costs")}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {transactions.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-black truncate max-w-[120px]">
                    {t.description || t.category || "Expense"}
                  </span>
                  <span className="text-xs text-gray-500 font-mono mt-1">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-red-600 font-mono text-sm font-bold">
                  <ArrowDownRight className="w-3 h-3" />
                  {t.amount.toLocaleString(language, { style: 'currency', currency: t.currency || 'USD' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-gray-300">
        <Link
          href={`/${language}/dashboard/costs-expenses`}
          className="block w-full py-3 text-center text-xs font-bold tracking-widest uppercase text-black hover:bg-black hover:text-white transition-colors"
        >
          {t("dashboard:widgets.view_finance", "Finance Overview")}
        </Link>
      </div>
    </motion.div>
  );
}
