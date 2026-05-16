"use client";

import React from 'react';
import { Settings, X, Type, Hash, Image as ImageIcon, Scissors, UserCheck, Minus } from 'lucide-react';
import { DocumentBlock } from './index';
import { TEMPLATE_VARIABLES } from '@/lib/templates/variables';

interface BlockSettingsPanelProps {
  block: DocumentBlock | undefined;
  onUpdate: (content: DocumentBlock['content']) => void;
  onClose: () => void;
}

export const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({ block, onUpdate, onClose }) => {
  if (!block) return null;

  const updateField = (field: string, value: string | number | boolean) => {
    onUpdate({ ...block.content, [field]: value });
  };

  const renderSpecificSettings = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Tekst Nagłówka</label>
              <input 
                type="text"
                value={block.content.text}
                onChange={(e) => updateField('text', e.target.value)}
                className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Poziom</label>
              <div className="flex border border-[#E5E5E5]">
                {[1, 2, 3].map(level => (
                  <button
                    key={level}
                    onClick={() => updateField('level', level)}
                    className={`flex-1 py-2 text-xs font-bold ${block.content.level === level ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#F4F4F5]'}`}
                  >
                    H{level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Treść Tekstu</label>
            <textarea 
              value={block.content.text}
              onChange={(e) => updateField('text', e.target.value)}
              className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none h-40 resize-none"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">URL Obrazu</label>
              <input 
                type="text"
                value={block.content.url || ''}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Szerokość (%)</label>
              <input 
                type="number"
                value={block.content.width || 100}
                onChange={(e) => updateField('width', parseInt(e.target.value))}
                className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Wyrównanie</label>
              <div className="flex border border-[#E5E5E5]">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateField('align', align)}
                    className={`flex-1 py-2 text-[10px] uppercase font-bold ${block.content.align === align ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#F4F4F5]'}`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="space-y-4">
            <p className="text-[10px] text-[#A1A1AA]">Edycja tabeli dostępna wkrótce. Obecnie generuje standardowy kosztorys.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#71717A]">Pokaż nagłówki</span>
              <input 
                type="checkbox" 
                checked={block.content.showHeaders !== false}
                onChange={(e) => updateField('showHeaders', e.target.checked)}
                className="w-4 h-4 accent-[#0A0A0A]"
              />
            </div>
          </div>
        );
      case 'variable':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">Wybierz Zmienną</label>
              <select 
                value={block.content.variable || ''}
                onChange={(e) => updateField('variable', e.target.value)}
                className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none bg-white"
              >
                <option value="">Wybierz...</option>
                {TEMPLATE_VARIABLES.map(v => (
                  <option key={v.key} value={v.key}>{v.label}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-[#A1A1AA]">Zmienna zostanie automatycznie uzupełniona w podglądzie.</p>
          </div>
        );
      default:
        return <p className="text-xs text-[#71717A]">Brak dodatkowych ustawień dla tego typu bloku.</p>;
    }
  };

  const getIcon = () => {
    switch (block.type) {
      case 'heading': return <Type size={14} />;
      case 'text': return <Type size={14} />;
      case 'image': return <ImageIcon size={14} />;
      case 'divider': return <Minus size={14} />;
      case 'page-break': return <Scissors size={14} />;
      case 'signature': return <UserCheck size={14} />;
      case 'variable': return <Hash size={14} />;
      default: return <Settings size={14} />;
    }
  };

  return (
    <div className="w-80 border-l border-[#E5E5E5] bg-white overflow-y-auto h-full shadow-lg z-30">
      <div className="p-4 border-b border-[#F4F4F5] bg-[#FAFAFA] flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#71717A] flex items-center gap-2">
          {getIcon()} Ustawienia Bloku
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-[#E5E5E5] transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-[#A1A1AA]">Typ Bloku</label>
          <div className="text-xs font-bold uppercase bg-[#FAFAFA] p-2 border border-[#E5E5E5]">
            {block.type}
          </div>
        </div>

        <div className="h-px bg-[#F4F4F5]" />

        {renderSpecificSettings()}
      </div>
    </div>
  );
};
