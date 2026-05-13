"use client";

import { useTranslation } from "react-i18next";
import { useLeadSearchStore } from "@/store/leadSearchStore";

export default function GDPRConsent() {
  const { t } = useTranslation("dashboard");
  const acceptGDPR = useLeadSearchStore((state) => state.acceptGDPR);
  const hasAcceptedGDPR = useLeadSearchStore((state) => state.hasAcceptedGDPR);

  if (hasAcceptedGDPR) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA]/90 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E5E5] p-12">
        <h2 className="font-bold text-[28px] leading-[1.2] text-[#0A0A0A] mb-4">
          {t("lead_search_ui.gdpr_title")}
        </h2>
        <p className="font-light text-[16px] leading-[1.65] text-[#0A0A0A] mb-8">
          {t("lead_search_ui.gdpr_text")}
        </p>
        <button
          onClick={acceptGDPR}
          className="w-full h-[48px] bg-[#0A0A0A] text-[#FAFAFA] text-[16px] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border hover:border-[#0A0A0A]"
        >
          {t("lead_search_ui.gdpr_accept")}
        </button>
      </div>
    </div>
  );
}
