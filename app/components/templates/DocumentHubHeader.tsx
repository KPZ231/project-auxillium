"use client";

import React from 'react';
import { FileText, Layout, Search, Filter, Plus } from 'lucide-react';
import { useTranslation } from '@/app/context/TranslationContext';
import { useRouter } from 'next/navigation';
import { QuickDocumentModal } from './QuickDocumentModal';
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";

interface DocumentHubHeaderProps {
  language: string;
  spaceId: string;
}

export const DocumentHubHeader: React.FC<DocumentHubHeaderProps> = ({ language, spaceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="mb-10 w-full">
      <PageHeader
        title={t("documents:hub.subtitle", "Utworzone Dokumenty")}
        subtitle={t("documents:hub.title", "Centrum Dokumentacji")}
        primaryAction={{
          label: t("documents:hub.create_document", "Utwórz dokument").toUpperCase(),
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
        }}
        secondaryAction={{
          label: t("documents:hub.manage_templates", "Zarządzaj szablonami").toUpperCase(),
          href: `/${language}/dashboard/templates`,
          icon: <Layout className="w-4 h-4" strokeWidth={2.5} />
        }}
      />

      <div className="mt-8 flex flex-col md:flex-row items-center gap-4 bg-[#FAFAFA] border border-[#E5E5E5] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
          <input 
            type="text" 
            placeholder={t("documents:hub.search_placeholder", "Szukaj dokumentu...")}
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="h-6 w-px bg-[#E5E5E5] hidden md:block" />
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#71717A] hover:text-[#0A0A0A] transition-colors">
          <Filter size={16} />
          {t("documents:hub.filter", "Filtruj")}
        </button>
      </div>

      {isModalOpen && (
        <QuickDocumentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          spaceId={spaceId}
        />
      )}
    </div>
  );
};
