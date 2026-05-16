"use client";

import React from 'react';
import { MoreVertical, Copy, Trash2, Edit3, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { deleteTemplate, duplicateTemplate } from '@/actions/templates';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: any;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      const res = await deleteTemplate(template.id);
      if (res.success) {
        toast.success('Szablon został usunięty');
      } else {
        toast.error('Błąd podczas usuwania szablonu');
      }
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await duplicateTemplate(template.id);
    if (res.success) {
      toast.success('Szablon został powielony');
    } else {
      toast.error('Błąd podczas powielania szablonu');
    }
  };

  return (
    <div 
      className="group relative border border-[#E5E5E5] bg-white p-6 cursor-pointer hover:border-[#0A0A0A] transition-colors duration-200"
      onClick={() => router.push(`/dashboard/templates/${template.id}/edit`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#FAFAFA] border border-[#E5E5E5] group-hover:border-[#0A0A0A] transition-colors">
          <FileText size={20} className="text-[#0A0A0A]" />
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-[#F4F4F5] transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] z-10 py-1 shadow-none">
              <button 
                onClick={handleDuplicate}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#F4F4F5] flex items-center gap-2"
              >
                <Copy size={14} /> Duplikuj
              </button>
              <button 
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#F4F4F5] flex items-center gap-2"
              >
                <Trash2 size={14} /> Usuń
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[#0A0A0A] mb-1 truncate">
        {template.name}
      </h3>
      <p className="text-sm text-[#71717A] mb-4">
        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#F4F4F5]">
        <span className="text-xs text-[#A1A1AA]">
          Edytowano {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true, locale: pl })}
        </span>
        <span className="text-xs font-mono text-[#71717A]">
          Użyto: {template.usageCount}
        </span>
      </div>
    </div>
  );
};
