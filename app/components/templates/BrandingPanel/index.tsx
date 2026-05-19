"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Upload, Type, Palette, Layout, Settings } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { BrandingSettings } from '@/types/templates';

interface BrandingPanelProps {
  settings: BrandingSettings;
  onChange: (settings: BrandingSettings) => void;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({ settings, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>('header');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updateSetting = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const updateMargin = (marginKey: keyof BrandingSettings['margins'], value: number) => {
    onChange({
      ...settings,
      margins: { ...settings.margins, [marginKey]: value }
    });
  };

  return (
    <div className="w-80 border-l border-[#E5E5E5] bg-white overflow-y-auto h-full scrollbar-hide">
      <div className="p-4 border-b border-[#F4F4F5] bg-[#FAFAFA]">
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#71717A] flex items-center gap-2">
          <Settings size={14} /> Brand Settings
        </h4>
      </div>

      {/* HEADER SETTINGS */}
      <div className="border-b border-[#F4F4F5]">
        <button 
          onClick={() => toggleSection('header')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <Layout size={16} /> Nagłówek
          </span>
          {activeSection === 'header' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'header' && (
          <div className="p-4 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#71717A]">Pokaż nagłówek</span>
              <input 
                type="checkbox" 
                checked={settings.showHeader}
                onChange={(e) => updateSetting('showHeader', e.target.checked)}
                className="w-4 h-4 accent-[#0A0A0A]"
              />
            </div>
            {settings.showHeader && (
              <>
                <div className="space-y-2">
                  <span className="text-xs text-[#71717A]">Logo (URL)</span>
                  <input 
                    type="text" 
                    value={settings.logo || ''}
                    onChange={(e) => updateSetting('logo', e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-[#71717A]">Tekst nagłówka</span>
                  <textarea 
                    value={settings.headerText || ''}
                    onChange={(e) => updateSetting('headerText', e.target.value)}
                    className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none h-20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-[#71717A]">Wyrównanie</span>
                  <div className="flex border border-[#E5E5E5]">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateSetting('headerAlignment', align as "left" | "center" | "right")}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold ${
                          settings.headerAlignment === align ? 'bg-[#0A0A0A] text-white' : 'hover:bg-[#F4F4F5]'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TYPOGRAPHY */}
      <div className="border-b border-[#F4F4F5]">
        <button 
          onClick={() => toggleSection('typography')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <Type size={16} /> Typografia
          </span>
          {activeSection === 'typography' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'typography' && (
          <div className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-[#71717A]">Czcionka</span>
              <select 
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none bg-white"
              >
                <option value="Inter">Inter (Sans)</option>
                <option value="Roboto">Roboto</option>
                <option value="Merriweather">Merriweather (Serif)</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-[#71717A]">Rozmiar tekstu</span>
                <span className="text-xs font-mono">{settings.fontSize}px</span>
              </div>
              <input 
                type="range" min="11" max="18" 
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-full accent-[#0A0A0A]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-[#71717A]">Interlinia</span>
                <span className="text-xs font-mono">{settings.lineHeight}</span>
              </div>
              <input 
                type="range" min="1.0" max="2.0" step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-[#0A0A0A]"
              />
            </div>
          </div>
        )}
      </div>

      {/* COLORS */}
      <div className="border-b border-[#F4F4F5]">
        <button 
          onClick={() => toggleSection('colors')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <Palette size={16} /> Kolory
          </span>
          {activeSection === 'colors' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'colors' && (
          <div className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-[#71717A]">Kolor akcentu</span>
              <div className="flex gap-3 items-center">
                <div 
                  className="w-8 h-8 border border-[#E5E5E5]" 
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <input 
                  type="text" 
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1 p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
                />
              </div>
              <div className="pt-2 flex justify-center">
                <HexColorPicker 
                  color={settings.primaryColor} 
                  onChange={(color) => updateSetting('primaryColor', color)}
                  style={{ width: '100%', height: '150px' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MARGINS */}
      <div className="border-b border-[#F4F4F5]">
        <button 
          onClick={() => toggleSection('margins')}
          className="w-full p-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <Layout size={16} /> Marginesy (mm)
          </span>
          {activeSection === 'margins' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'margins' && (
          <div className="p-4 pt-0 grid grid-cols-2 gap-4">
            {['top', 'bottom', 'left', 'right'].map((side) => (
              <div key={side} className="space-y-1">
                <span className="text-[10px] uppercase text-[#A1A1AA]">{side}</span>
                <input 
                  type="number" 
                  value={settings.margins[side as keyof BrandingSettings['margins']]}
                  onChange={(e) => updateMargin(side as keyof BrandingSettings['margins'], parseInt(e.target.value))}
                  className="w-full p-2 border border-[#E5E5E5] text-xs focus:border-[#0A0A0A] outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-8"></div>
    </div>
  );
};
