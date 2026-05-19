"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { startLeadSearch } from "@/actions/leadSearch";
import { useLeadSearchStore } from "@/store/leadSearchStore";
import { toast } from "sonner";

export default function SearchForm() {
  const { t } = useTranslation("dashboard");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addJob = useLeadSearchStore((state) => state.addJob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);
    const result = await startLeadSearch(query, limit);

    if (result.success && result.data?.job_id) {
      addJob({
        job_id: result.data.job_id,
        query,
        limit,
        status: "pending",
        progress: 0,
        total: 0,
        leads: 0,
      });
      setQuery("");
    } else {
      if (result.error === "rate_limit_error") {
        toast.error(t("lead_search_ui.rate_limit_error"));
      } else {
        toast.error(result.error || "Failed to start search");
      }
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-16">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        <div className="flex-1">
          <label className="block text-[14px] font-regular text-[#71717A] mb-2 uppercase tracking-wide">
            {t("lead_search_ui.query_label")}
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("lead_search_ui.query_placeholder")}
            disabled={isSubmitting}
            className="w-full h-[40px] bg-[#FFFFFF] border-b border-[#D4D4D8] text-[#0A0A0A] text-[14px] px-0 outline-none focus:border-b-2 focus:border-[#0A0A0A] transition-all disabled:bg-[#F4F4F5] disabled:border-[#E5E5E5]"
            required
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-[14px] font-regular text-[#71717A] mb-2 uppercase tracking-wide">
            {t("lead_search_ui.limit_label")}
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={1}
            max={500}
            disabled={isSubmitting}
            className="w-full h-[40px] bg-[#FFFFFF] border-b border-[#D4D4D8] text-[#0A0A0A] text-[14px] px-0 outline-none focus:border-b-2 focus:border-[#0A0A0A] transition-all disabled:bg-[#F4F4F5] disabled:border-[#E5E5E5]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[40px] px-8 bg-[#0A0A0A] text-[#FAFAFA] text-[14px] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border hover:border-[#0A0A0A] disabled:opacity-30 disabled:hover:bg-[#0A0A0A] disabled:hover:text-[#FAFAFA] disabled:border-none"
        >
          {isSubmitting ? t("lead_search_ui.scanning") : t("lead_search_ui.scan_button")}
        </button>
      </div>
    </form>
  );
}
