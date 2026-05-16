"use client";

import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useTranslation } from '@/app/context/TranslationContext';
import { TemplateTypeModal } from './TemplateTypeModal';

interface TemplateListHeaderProps {
  spaceId: string;
}

export const TemplateListHeader: React.FC<TemplateListHeaderProps> = ({ spaceId }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h3 className="font-light text-base text-[#71717A] tracking-tight uppercase mb-1">
            {t("templates:list.title", "Zarządzanie")}
          </h3>
          <h2 className="font-bold text-3xl tracking-wide uppercase">
            {t("templates:list.subtitle", "Szablony Dokumentów")}
          </h2>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0A0A0A] text-white px-6 py-3 flex items-center gap-2 hover:bg-[#262626] transition-colors font-medium"
        >
          <Plus size={18} />
          {t("templates:list.add_new", "Utwórz szablon")}
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#FAFAFA] border border-[#E5E5E5] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
          <input 
            type="text" 
            placeholder={t("templates:list.search_placeholder", "Szukaj szablonu...")}
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="h-6 w-px bg-[#E5E5E5] hidden md:block" />
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#71717A] hover:text-[#0A0A0A] transition-colors">
          <Filter size={16} />
          {t("templates:list.filter", "Filtruj")}
        </button>
      </div>

      {isModalOpen && (
        <TemplateTypeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          spaceId={spaceId}
        />
      )}
    </div>
  );
};
