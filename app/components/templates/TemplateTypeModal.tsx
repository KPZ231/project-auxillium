"use client";

import React from 'react';
import { X } from 'lucide-react';
import { TEMPLATE_PRESETS } from '@/lib/templates/presets';
import { createTemplate } from '@/actions/templates';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TemplateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
}

export const TemplateTypeModal: React.FC<TemplateTypeModalProps> = ({ isOpen, onClose, spaceId }) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleCreate = async (presetId?: string) => {
    setLoading(true);
    const preset = presetId ? TEMPLATE_PRESETS.find(p => p.id === presetId) : null;
    
    const res = await createTemplate({
      name: preset ? preset.name : 'Nowy szablon',
      type: preset ? preset.type : 'custom',
      spaceId,
      presetId
    });

    if (res.success && res.id) {
      toast.success('Szablon został utworzony');
      router.push(`/dashboard/templates/${res.id}/edit`);
      onClose();
    } else {
      toast.error('Błąd podczas tworzenia szablonu');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl border border-[#0A0A0A] shadow-none">
        <div className="flex justify-between items-center p-6 border-b border-[#F4F4F5]">
          <h2 className="text-xl font-bold uppercase tracking-wide">Wybierz typ szablonu</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F4F5] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          {TEMPLATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleCreate(preset.id)}
              disabled={loading}
              className="flex flex-col items-start p-6 border border-[#E5E5E5] hover:border-[#0A0A0A] bg-[#FAFAFA] text-left transition-all hover:bg-white disabled:opacity-50"
            >
              <span className="text-3xl mb-3">{preset.icon}</span>
              <h4 className="font-bold text-[#0A0A0A] mb-1">{preset.name}</h4>
              <p className="text-sm text-[#71717A] leading-relaxed">{preset.description}</p>
            </button>
          ))}

          <button
            onClick={() => handleCreate()}
            disabled={loading}
            className="flex flex-col items-start p-6 border border-dashed border-[#E5E5E5] hover:border-[#0A0A0A] bg-white text-left transition-all disabled:opacity-50"
          >
            <span className="text-3xl mb-3">➕</span>
            <h4 className="font-bold text-[#0A0A0A] mb-1">Pusty szablon</h4>
            <p className="text-sm text-[#71717A] leading-relaxed">Zacznij od czystej kartki</p>
          </button>
        </div>
        
        <div className="p-6 border-t border-[#F4F4F5] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium hover:underline"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};
