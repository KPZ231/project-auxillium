"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Loader2, Search } from 'lucide-react';
import { getClientsForAI, getProjectsForAI } from '@/actions/ai/aiTools';
import { getTemplates } from '@/actions/templates';
import { toast } from 'sonner';

interface QuickDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  initialClientId?: string;
  initialProjectId?: string;
}

interface Template { id: string; name: string; type: string; }
interface Client { id: string; name: string; }
interface Project { id: string; projectName: string; }

export const QuickDocumentModal: React.FC<QuickDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  spaceId,
  initialClientId = '',
  initialProjectId = ''
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClient, setSelectedClient] = useState(initialClientId);
  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const [templatesRes, clientsRes, projectsRes] = await Promise.all([
          getTemplates(spaceId),
          getClientsForAI(spaceId),
          getProjectsForAI(spaceId)
        ]);
        
        if (templatesRes.success && templatesRes.templates) setTemplates(templatesRes.templates as unknown as Template[]);
        if (Array.isArray(clientsRes)) setClients(clientsRes as unknown as Client[]);
        if (Array.isArray(projectsRes)) setProjects(projectsRes as unknown as Project[]);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen, spaceId]);

  const handleExport = async () => {
    if (!selectedTemplate) {
      toast.error('Wybierz szablon dokumentu');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          clientId: selectedClient,
          dealId: selectedProject,
          spaceId
        })
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dokument_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Dokument został wygenerowany i zapisany w hubie');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Błąd podczas generowania dokumentu');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl border border-[#0A0A0A] shadow-none">
        <div className="flex justify-between items-center p-6 border-b border-[#F4F4F5]">
          <h2 className="text-xl font-bold uppercase tracking-wide">Utwórz Nowy Dokument</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F4F5] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* TEMPLATE SELECTION */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Wybierz Szablon</label>
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-3 border border-[#E5E5E5] focus:border-[#0A0A0A] outline-none bg-white text-sm"
              disabled={loading}
            >
              <option value="">Wybierz szablon...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CLIENT SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Klient</label>
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-3 border border-[#E5E5E5] focus:border-[#0A0A0A] outline-none bg-white text-sm"
                disabled={loading}
              >
                <option value="">Brak powiązania...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* PROJECT SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Projekt / Deal</label>
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-3 border border-[#E5E5E5] focus:border-[#0A0A0A] outline-none bg-white text-sm"
                disabled={loading}
              >
                <option value="">Brak powiązania...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#FAFAFA] p-4 border border-[#E5E5E5] flex gap-3 items-center">
            <FileText className="text-[#A1A1AA]" size={24} />
            <div className="text-xs text-[#71717A]">
              Wybrany szablon zostanie uzupełniony danymi klienta i projektu, a następnie zapisany w historii dokumentów.
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-[#F4F4F5] flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium hover:underline"
          >
            Anuluj
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || loading || !selectedTemplate}
            className="bg-[#0A0A0A] text-white px-8 py-2 flex items-center gap-2 hover:bg-[#262626] transition-colors font-medium text-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            {isExporting ? 'Generowanie...' : 'Generuj Dokument'}
          </button>
        </div>
      </div>
    </div>
  );
};
