"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import { getLeads } from "@/actions/getLeads";
import LoadingCircle from "@/app/components/UI/LoadingCircle";
import { useTranslation } from "@/app/context/TranslationContext";
import { ChevronRight } from "lucide-react";

interface Lead {
  id: string;
  leadName: string;
  contactName: string | null;
  status: string;
}

export default function ClientsLeadWidget() {
  const { t, language } = useTranslation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const result = await getLeads();
        if (result.success && result.data) {
          // Take top 3 recent leads
          setLeads((result.data as Lead[]).slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching leads", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
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
        <h3 className="text-sm font-bold text-black tracking-widest uppercase">
          {t("dashboard:widgets.recent_leads", "Recent Leads")}
        </h3>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {loading ? (
          <div className="grow flex items-center justify-center">
            <LoadingCircle size="md" />
          </div>
        ) : leads.length === 0 ? (
          <div className="grow flex items-center justify-center text-xs font-medium text-gray-400">
            {t("dashboard:widgets.no_leads", "No recent leads")}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {leads.map((lead, idx) => (
              <Link
                key={lead.id}
                href={`/${language}/dashboard/leads/${lead.id}`}
                className="group flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-black group-hover:underline decoration-1 underline-offset-4">
                    {lead.leadName}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 border border-[#D4D4D8] text-[#71717A] w-fit">
                    {(lead.status || "COLD").toLowerCase()}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-gray-300">
        <Link
          href={`/${language}/dashboard/leads`}
          className="block w-full py-3 text-center text-xs font-bold tracking-widest uppercase text-black hover:bg-black hover:text-white transition-colors"
        >
          {t("dashboard:widgets.view_all_leads", "View Pipeline")}
        </Link>
      </div>
    </motion.div>
  );
}
