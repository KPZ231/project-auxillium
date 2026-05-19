"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Download, 
  Boxes, 
  Code,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MarkdownPanel } from './MarkdownPanel';
import { PreviewPanel } from './PreviewPanel';
import { BlockEditor, DocumentBlock } from './BlockEditor';
import { BrandingPanel } from '../BrandingPanel';
import { DocumentExportModal } from '../DocumentExportModal';
import { BrandingSettings } from '@/types/templates';
import { updateTemplate } from '@/actions/templates';
import { BlockSettingsPanel } from './BlockEditor/BlockSettingsPanel';
import { toast } from 'sonner';
import { blocksToMarkdown, markdownToBlocks } from '@/lib/templates/converters';

interface TemplateData {
  id: string;
  name: string;
  type: string;
  content: string;
  blocks: DocumentBlock[];
  branding: BrandingSettings;
  spaceId: string;
  updatedAt: string;
}

interface TemplateEditorProps {
  template: TemplateData;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template: initialTemplate }) => {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [mode, setMode] = useState<'markdown' | 'blocks'>('blocks');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date(initialTemplate.updatedAt));
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Initial load: parse markdown to blocks if blocks are missing
  useEffect(() => {
    if ((!template.blocks || template.blocks.length === 0) && template.content) {
      const blocks = markdownToBlocks(template.content);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTemplate(prev => ({ ...prev, blocks }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize editors when mode changes
  const handleModeChange = (newMode: 'markdown' | 'blocks') => {
    if (mode === newMode) return;

    if (newMode === 'markdown') {
      // Sync blocks -> markdown
      const markdown = blocksToMarkdown(template.blocks || []);
      setTemplate({ ...template, content: markdown });
    } else {
      // Sync markdown -> blocks
      const blocks = markdownToBlocks(template.content || '');
      setTemplate({ ...template, blocks });
    }
    
    setMode(newMode);
    setSelectedBlockId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Ensure content is synced to markdown before saving
    const finalContent = blocksToMarkdown(template.blocks || []);
    
    const res = await updateTemplate(template.id, {
      name: template.name,
      content: finalContent,
      branding: template.branding,
      blocks: template.blocks
    });

    if (res.success) {
      toast.success('Szablon został zapisany');
      setLastSaved(new Date());
    } else {
      toast.error('Błąd podczas zapisywania');
    }
    setIsSaving(false);
  };

  // Keep template.content in sync with blocks for real-time preview
  const updateBlocks = (blocks: DocumentBlock[]) => {
    const markdown = blocksToMarkdown(blocks);
    setTemplate(prev => ({ ...prev, blocks, content: markdown }));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* TOOLBAR */}
      <div className="h-auto md:h-16 py-4 md:py-0 border-b border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 bg-white z-20 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/templates')}
            className="p-2 hover:bg-[#F4F4F5] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-[#E5E5E5]" />
          <input 
            type="text" 
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            className="font-bold text-lg focus:outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex border border-[#E5E5E5] bg-[#FAFAFA] p-1">
            <button 
              onClick={() => handleModeChange('markdown')}
              className={`px-4 py-1.5 text-xs font-bold flex items-center gap-2 transition-all ${
                mode === 'markdown' ? 'bg-white text-[#0A0A0A] border border-[#E5E5E5] shadow-sm' : 'text-[#71717A]'
              }`}
            >
              <Code size={14} /> Markdown
            </button>
            <button 
              onClick={() => handleModeChange('blocks')}
              className={`px-4 py-1.5 text-xs font-bold flex items-center gap-2 transition-all ${
                mode === 'blocks' ? 'bg-white text-[#0A0A0A] border border-[#E5E5E5] shadow-sm' : 'text-[#71717A]'
              }`}
            >
              <Boxes size={14} /> Bloki
            </button>
          </div>

          <div className="h-6 w-px bg-[#E5E5E5]" />

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0A0A0A] text-white px-6 py-2 flex items-center gap-2 hover:bg-[#262626] transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
          </button>
          
          <button 
            onClick={() => setIsPreviewModalOpen(true)}
            className="border border-[#E5E5E5] px-4 py-2 hover:bg-[#FAFAFA] transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Eye size={16} /> Pokaż podgląd
          </button>
          
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="border border-[#E5E5E5] px-4 py-2 hover:bg-[#FAFAFA] transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} /> Eksportuj PDF
          </button>
        </div>
      </div>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:mr-[320px]' : 'mr-0'}`}>
          <div className="flex-1 flex overflow-hidden">
            {mode === 'markdown' ? (
              <MarkdownPanel 
                value={template.content} 
                onChange={(content) => {
                  // Keep blocks in sync with markdown in real-time? 
                  // No, that might be too much. We sync on mode switch.
                  setTemplate({ ...template, content });
                }} 
              />
            ) : (
              <BlockEditor 
                blocks={template.blocks as DocumentBlock[] || []}
                onChange={updateBlocks}
                branding={template.branding}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
              />
            )}
          </div>
        </div>

        {/* Sidebar Toggle Arrow */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-30 bg-white border border-[#E5E5E5] p-1 hover:bg-[#FAFAFA] transition-all shadow-sm ${
            isSidebarOpen ? 'right-[320px] max-md:right-0 max-md:-translate-x-full' : 'right-0'
          }`}
        >
          {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Sidebars */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full md:w-[320px] bg-white border-l border-[#E5E5E5] z-20 transition-transform duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedBlockId ? (
            <BlockSettingsPanel 
              block={template.blocks.find((b: DocumentBlock) => b.id === selectedBlockId)}
              onUpdate={(content) => {
                const newBlocks = template.blocks.map((b: DocumentBlock) => 
                  b.id === selectedBlockId ? { ...b, content } : b
                );
                updateBlocks(newBlocks);
              }}
              onClose={() => setSelectedBlockId(null)}
            />
          ) : (
            <BrandingPanel 
              settings={template.branding as BrandingSettings}
              onChange={(branding) => setTemplate({ ...template, branding })}
            />
          )}
        </div>
      </div>
      
      {/* EXPORT MODAL */}
      <DocumentExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        spaceId={template.spaceId}
        templateId={template.id}
      />

      {/* PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-8 p-4">
          <div className="bg-white w-full max-w-5xl h-full flex flex-col rounded-lg overflow-hidden relative shadow-2xl">
            <div className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 shrink-0 z-10 relative shadow-sm">
              <h2 className="font-bold text-sm uppercase tracking-widest">Podgląd Dokumentu</h2>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#0A0A0A] font-bold text-xs uppercase tracking-widest"
              >
                Zamknij
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <PreviewPanel 
                content={template.content} 
                branding={template.branding as BrandingSettings} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* FOOTER / STATUS BAR */}
      <div className="h-8 border-t border-[#E5E5E5] bg-[#FAFAFA] px-4 flex items-center justify-between">
        <div className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-widest">
          {template.type} template · {template.id}
        </div>
        <div className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-widest">
          {lastSaved && `Ostatnio zapisano: ${lastSaved.toLocaleTimeString()}`}
        </div>
      </div>
    </div>
  );
};
