"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripHorizontal } from 'lucide-react';
import { DocumentBlock } from './index';
import { TEMPLATE_VARIABLES } from '@/lib/templates/variables';

interface SortableBlockProps {
  block: DocumentBlock;
  isSelected?: boolean;
  onSelect: () => void;
  onUpdate: (content: Record<string, unknown>) => void;
  onDelete: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const
  };

  const renderVariablePreview = (text: string) => {
    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const example = TEMPLATE_VARIABLES.find(v => v.key === key.trim())?.example;
      return example ? `<span class="bg-[#FAFAFA] text-[#0A0A0A] px-1 font-semibold border-b border-[#0A0A0A]">${example}</span>` : match;
    });
  };

  const renderContent = () => {
    if (!isSelected && block.type !== 'divider' && block.type !== 'page-break') {
      // Preview mode when not selected
      const contentStr = typeof block.content.text === 'string' ? block.content.text : '';
      const preview = renderVariablePreview(contentStr || '');
      
      return (
        <div 
          className="text-sm leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: preview || (block.type === 'heading' ? 'Nagłówek...' : 'Zacznij pisać...') }} 
        />
      );
    }

    switch (block.type) {
      case 'heading':
        return (
          <input 
            autoFocus
            type="text"
            value={block.content.text}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="w-full text-2xl font-bold border-none outline-none focus:ring-0 p-0 bg-transparent"
            placeholder="Nagłówek..."
          />
        );
      case 'text':
        return (
          <textarea 
            autoFocus
            value={block.content.text}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="w-full text-sm border-none outline-none focus:ring-0 p-0 bg-transparent resize-none min-h-[40px]"
            placeholder="Zacznij pisać..."
            rows={Math.max(2, block.content.text?.split('\n').length || 1)}
          />
        );
      case 'image':
        return (
          <div className="space-y-2">
            {block.content.url ? (
              <img 
                src={block.content.url} 
                alt="Block" 
                style={{ width: `${block.content.width || 100}%` }}
                className="max-h-[300px] object-contain"
              />
            ) : (
              <div className="bg-[#FAFAFA] border border-dashed border-[#D4D4D8] p-8 text-center text-xs text-[#A1A1AA]">
                Brak obrazu. Ustaw URL w panelu bocznym.
              </div>
            )}
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#E5E5E5]">
              <tbody>
                <tr>
                  <td className="border border-[#E5E5E5] p-2 bg-[#FAFAFA] font-bold text-xs">Nagłówek 1</td>
                  <td className="border border-[#E5E5E5] p-2 bg-[#FAFAFA] font-bold text-xs">Nagłówek 2</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E5E5] p-2 text-sm italic text-[#A1A1AA]">Dostępne w pełnym edytorze</td>
                  <td className="border border-[#E5E5E5] p-2 text-sm italic text-[#A1A1AA]">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'variable':
        return (
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 flex items-center justify-between">
            <span className="text-xs font-mono text-[#0A0A0A]">{"{{" + (block.content.variable || 'wybierz_zmienną') + "}}"}</span>
            <span className="text-[10px] text-[#A1A1AA] uppercase">Zmienna</span>
          </div>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-[#0A0A0A] pl-4 italic text-sm text-[#71717A]">
            <textarea 
              autoFocus
              value={block.content.text}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
              className="w-full border-none outline-none focus:ring-0 p-0 bg-transparent resize-none"
              placeholder="Cytat..."
            />
          </blockquote>
        );
      case 'list':
        return (
          <div className="space-y-2 pl-4">
             {(block.content.items || ['Element listy...']).map((item: string, i: number) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                 <input 
                   type="text"
                   value={item}
                   onPointerDown={(e) => e.stopPropagation()}
                   onChange={(e) => {
                     const newItems = [...(block.content.items || [])];
                     newItems[i] = e.target.value;
                     onUpdate({ ...block.content, items: newItems });
                   }}
                   className="flex-1 text-sm border-none outline-none focus:ring-0 p-0 bg-transparent"
                 />
               </div>
             ))}
             <button 
               onClick={() => onUpdate({ ...block.content, items: [...(block.content.items || []), ''] })}
               className="text-[10px] uppercase font-bold text-[#A1A1AA] hover:text-[#0A0A0A]"
             >
               + Dodaj element
             </button>
          </div>
        );
      case 'divider':
        return <div className="h-px bg-[#E5E5E5] w-full my-4" />;
      case 'page-break':
        return (
          <div className="border-t border-dashed border-[#E5E5E5] w-full my-8 flex items-center justify-center">
            <span className="bg-white px-4 text-[10px] text-[#A1A1AA] uppercase tracking-widest -mt-2">Podział strony</span>
          </div>
        );
      case 'signature':
        return (
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="border-t border-[#0A0A0A] pt-2">
              <p className="text-[10px] uppercase font-bold tracking-tight">Podpis Wykonawcy</p>
            </div>
            <div className="border-t border-[#0A0A0A] pt-2">
              <p className="text-[10px] uppercase font-bold tracking-tight">Podpis Zleceniodawcy</p>
            </div>
          </div>
        );
      default:
        return <div className="text-xs text-[#71717A]">Blok typu {block.type}</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative bg-white border transition-all ${
        isSelected ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]' : 'border-transparent hover:border-[#F4F4F5]'
      } p-4 flex gap-4 items-start cursor-grab active:cursor-grabbing mb-1`}
    >
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>

      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-[#D4D4D8] hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
        <div className="p-1 text-[#D4D4D8]">
          <GripHorizontal size={16} />
        </div>
      </div>
    </div>
  );
};
