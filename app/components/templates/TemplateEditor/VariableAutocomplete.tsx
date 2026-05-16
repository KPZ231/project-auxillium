"use client";

import React, { useEffect, useState } from 'react';
import { TEMPLATE_VARIABLES } from '@/lib/templates/variables';

interface VariableAutocompleteProps {
  onSelect: (variable: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const VariableAutocomplete: React.FC<VariableAutocompleteProps> = ({ onSelect, onClose, position }) => {
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const filtered = TEMPLATE_VARIABLES.filter(v => 
    v.key.toLowerCase().includes(filter.toLowerCase()) || 
    v.label.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].key);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) {
    onClose();
    return null;
  }

  return (
    <div 
      className="fixed z-50 w-64 bg-white border border-[#0A0A0A] shadow-none overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-[#F4F4F5] bg-[#FAFAFA]">
        <input 
          autoFocus
          type="text" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtruj zmienne..."
          className="w-full bg-transparent text-xs focus:outline-none"
        />
      </div>
      <div className="max-h-60 overflow-y-auto">
        {filtered.map((v, i) => (
          <button
            key={v.key}
            onClick={() => onSelect(v.key)}
            onMouseEnter={() => setSelectedIndex(i)}
            className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 ${
              i === selectedIndex ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#F4F4F5]'
            }`}
          >
            <span className="font-bold">{v.label}</span>
            <span className={`text-[10px] ${i === selectedIndex ? 'text-white/70' : 'text-[#71717A]'}`}>
              {`{{${v.key}}}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
