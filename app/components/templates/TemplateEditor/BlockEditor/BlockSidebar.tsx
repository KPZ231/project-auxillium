"use client";

import React from 'react';
import { 
  Type, 
  Heading, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Minus, 
  Hash, 
  UserCheck, 
  Scissors,
  List,
  Quote
} from 'lucide-react';
import { DocumentBlock } from './index';

interface BlockSidebarProps {
  onAdd: (type: DocumentBlock['type']) => void;
}

const BLOCK_TYPES: { type: DocumentBlock['type']; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { type: 'heading', label: 'Nagłówek', icon: Heading },
  { type: 'text', label: 'Tekst', icon: Type },
  { type: 'list', label: 'Lista', icon: List },
  { type: 'quote', label: 'Cytat', icon: Quote },
  { type: 'table', label: 'Tabela', icon: TableIcon },
  { type: 'image', label: 'Obraz', icon: ImageIcon },
  { type: 'divider', label: 'Linia', icon: Minus },
  { type: 'variable', label: 'Zmienna', icon: Hash },
  { type: 'signature', label: 'Podpis', icon: UserCheck },
  { type: 'page-break', label: 'Podział strony', icon: Scissors },
];

export const BlockSidebar: React.FC<BlockSidebarProps> = ({ onAdd }) => {
  return (
    <div className="w-64 border-r border-[#E5E5E5] bg-white p-4 space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-4">Bloki</h4>
      <div className="grid grid-cols-1 gap-2">
        {BLOCK_TYPES.map((block) => (
          <DraggableSidebarItem key={block.type} block={block} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
};

const DraggableSidebarItem = ({ block, onAdd }: { block: { type: DocumentBlock['type']; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }; onAdd: (type: DocumentBlock['type']) => void }) => {
  return (
    <button
      onClick={() => onAdd(block.type)}
      className="flex items-center gap-3 p-3 border border-[#E5E5E5] hover:border-[#0A0A0A] hover:bg-[#FAFAFA] transition-all text-sm group text-left w-full"
    >
      <block.icon size={18} className="text-[#71717A] group-hover:text-[#0A0A0A]" />
      <span className="font-medium">{block.label}</span>
    </button>
  );
};
