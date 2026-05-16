"use client";

import React from 'react';
import { FileText, Download, User, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface GeneratedDocumentCardProps {
  doc: any;
}

export const GeneratedDocumentCard: React.FC<GeneratedDocumentCardProps> = ({ doc }) => {
  return (
    <div className="group border border-[#E5E5E5] bg-white hover:border-[#0A0A0A] transition-all p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] group-hover:border-[#0A0A0A] transition-colors">
          <FileText size={24} className="text-[#0A0A0A]" />
        </div>
        <button 
          className="p-2 hover:bg-[#F4F4F5] transition-colors text-[#71717A] hover:text-[#0A0A0A]"
          title="Pobierz PDF"
        >
          <Download size={20} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-[#0A0A0A] mb-4 truncate">
        {doc.name || doc.template?.name || "Dokument bez nazwy"}
      </h3>

      <div className="space-y-3 mb-6">
        {doc.client && (
          <div className="flex items-center gap-3 text-sm text-[#71717A]">
            <User size={14} className="shrink-0" />
            <span className="truncate">{doc.client.name}</span>
          </div>
        )}
        {doc.project && (
          <div className="flex items-center gap-3 text-sm text-[#71717A]">
            <Briefcase size={14} className="shrink-0" />
            <span className="truncate">{doc.project.projectName}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-[#71717A]">
          <Calendar size={14} className="shrink-0" />
          <span>{format(new Date(doc.createdAt), 'd MMMM yyyy, HH:mm', { locale: pl })}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-[#F4F4F5] flex justify-between items-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1AA]">
          {doc.template?.type || "DOKUMENT"}
        </span>
        <button className="text-xs font-bold hover:underline">Podgląd</button>
      </div>
    </div>
  );
};
