"use client";

import GDPRConsent from "@/app/components/lead-search/gdpr-consent";
import SearchForm from "@/app/components/lead-search/search-form";
import JobResults from "@/app/components/lead-search/job-results";
import { useTranslation } from "@/app/context/TranslationContext";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function LeadSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="bg-[#FAFAFA] min-h-screen relative">
      {/* Generous spacing: 128px (space-10) top margin */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <header className="mb-16">
          <h1 className="font-bold text-[40px] leading-[1.1] text-[#0A0A0A] mb-4">
            {typeof t("dashboard:lead_search_ui.title", { returnObjects: true }) === 'string' ? t("dashboard:lead_search_ui.title") : "Lead Search"}
          </h1>
          <p className="font-light text-[16px] leading-[1.65] text-[#71717A] max-w-2xl">
            {typeof t("dashboard:lead_search_ui.subtitle", { returnObjects: true }) === 'string' ? t("dashboard:lead_search_ui.subtitle") : "Discover new leads through Google Maps extraction."}
          </p>
        </header>

        <GDPRConsent />
        <SearchForm />
        <JobResults />
      </div>

      {/* Beta Blocker Modal Overlay */}
      <div className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all">
        <div className="bg-[#FAFAFA] border border-[#0A0A0A] p-8 max-w-lg w-full flex flex-col relative rounded-none">
          <div className="mb-6">
            <div className="text-[12px] font-semibold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
              [ SYSTEM NOTICE ]
            </div>
            <h2 className="text-[24px] font-bold text-[#0A0A0A] leading-tight">
              {typeof t("dashboard:lead_search_ui.beta_banner_title", { returnObjects: true }) === 'string'
                ? t("dashboard:lead_search_ui.beta_banner_title")
                : "Feature nie działa w becie programu."}
            </h2>
          </div>

          <div className="border-t border-[#D4D4D8] my-4"></div>

          <p className="text-[14px] leading-[1.65] text-[#71717A] mb-8 font-light">
            {typeof t("dashboard:lead_search_ui.beta_banner_description", { returnObjects: true }) === 'string'
              ? t("dashboard:lead_search_ui.beta_banner_description")
              : "Narzędzie Wyszukiwarki Leadów umożliwia automatyczne wyszukiwanie i ekstrahowanie danych teleadresowych firm bezpośrednio z Google Maps na podstawie podanej frazy oraz określonego limitu wyników. Dzięki temu system pobiera w czasie rzeczywistym dane takie jak nazwa firmy, numer telefonu, adres e-mail, strona internetowa oraz oceny, pozwalając Ci na błyskawiczne zbudowanie gotowej bazy potencjalnych klientów dla Twojego biznesu."}
          </p>

          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full h-[48px] bg-[#0A0A0A] text-[#FAFAFA] text-[14px] font-medium uppercase tracking-wider transition-all duration-200 hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border border-transparent hover:border-[#0A0A0A]"
          >
            {typeof t("dashboard:lead_search_ui.beta_banner_button", { returnObjects: true }) === 'string'
              ? t("dashboard:lead_search_ui.beta_banner_button")
              : "Wróć do Dashboardu"}
          </button>
        </div>
      </div>
    </div>
  );
}
