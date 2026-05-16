"use client";

import React from 'react';
import { FileText, Layout, Search, Filter, Plus } from 'lucide-react';
import { useTranslation } from '@/app/context/TranslationContext';
import { useRouter } from 'next/navigation';
import { QuickDocumentModal } from './QuickDocumentModal';

interface DocumentHubHeaderProps {
  language: string;
  spaceId: string;
}

export const DocumentHubHeader: React.FC<DocumentHubHeaderProps> = ({ language, spaceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h3 className="font-light text-base text-[#71717A] tracking-tight uppercase mb-1">
            {t("documents:hub.title", "Centrum Dokumentacji")}
          </h3>
          <h2 className="font-bold text-3xl tracking-wide uppercase">
            {t("documents:hub.subtitle", "Utworzone Dokumenty")}
          </h2>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0A0A0A] text-white px-6 py-3 flex items-center gap-2 hover:bg-[#262626] transition-colors font-medium"
          >
            <Plus size={18} />
            {t("documents:hub.create_document", "Utwórz dokument")}
          </button>
          <button 
            onClick={() => router.push(`/${language}/dashboard/templates`)}
            className="border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 flex items-center gap-2 hover:bg-[#FAFAFA] transition-colors font-medium"
          >
            <Layout size={18} />
            {t("documents:hub.manage_templates", "Zarządzaj szablonami")}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#FAFAFA] border border-[#E5E5E5] p-2">
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
