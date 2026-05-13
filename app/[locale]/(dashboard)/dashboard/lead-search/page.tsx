"use client";

import GDPRConsent from "@/app/components/lead-search/gdpr-consent";
import SearchForm from "@/app/components/lead-search/search-form";
import JobResults from "@/app/components/lead-search/job-results";
import { useTranslation } from "@/app/context/TranslationContext";

export default function LeadSearchPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Generous spacing: 128px (space-10) top margin */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <header className="mb-16">
          <h1 className="font-bold text-[40px] leading-[1.1] text-[#0A0A0A] mb-4">
            {typeof t("lead_search_ui.title", { returnObjects: true }) === 'string' ? t("lead_search_ui.title") : "Lead Search"}
          </h1>
          <p className="font-light text-[16px] leading-[1.65] text-[#71717A] max-w-2xl">
            {typeof t("lead_search_ui.subtitle", { returnObjects: true }) === 'string' ? t("lead_search_ui.subtitle") : "Discover new leads through Google Maps extraction."}
          </p>
        </header>

        <GDPRConsent />
        <SearchForm />
        <JobResults />
      </div>
    </div>
  );
}
