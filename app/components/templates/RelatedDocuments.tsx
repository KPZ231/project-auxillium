"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, ExternalLink } from 'lucide-react';
import { getGeneratedDocuments } from '@/actions/templates';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { QuickDocumentModal } from './QuickDocumentModal';

interface RelatedDocumentsProps {
  spaceId: string;
  clientId?: string;
  projectId?: string;
}

export const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({ spaceId, clientId, projectId }) => {
  const [documents, setDocuments] = useState<{ id: string; clientId?: string; projectId?: string; createdAt: string; template?: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await getGeneratedDocuments(spaceId);
    if (res.success && res.documents) {
      // Filter locally for simplicity if the action doesn't support filtering yet
      const filtered = res.documents.filter((doc: { clientId?: string; projectId?: string }) => {
        if (clientId) return doc.clientId === clientId;
        if (projectId) return doc.projectId === projectId;
        return false;
      });
      setDocuments(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, clientId, projectId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A]">Dokumenty</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[#0A0A0A] text-white px-4 py-2 hover:bg-[#262626] transition-colors"
        >
          <Plus size={14} /> Utwórz Dokument
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A0A0A]"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#D4D4D8] bg-[#FAFAFA]">
          <p className="text-[12px] text-[#71717A] uppercase tracking-widest">Brak dokumentów powiązanych.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white group hover:border-[#0A0A0A] transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#FAFAFA] border border-[#E5E5E5] group-hover:border-[#0A0A0A] transition-colors">
                  <FileText size={18} className="text-[#0A0A0A]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A0A0A]">{doc.template?.name || "Dokument"}</h4>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider">
                    {format(new Date(doc.createdAt), 'd MMMM yyyy', { locale: pl })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#0A0A0A] transition-colors">
                  <Download size={16} />
                </button>
                <button className="p-2 hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#0A0A0A] transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <QuickDocumentModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            fetchDocuments(); // Refresh after creation
          }} 
          spaceId={spaceId}
          initialClientId={clientId}
          initialProjectId={projectId}
        />
      )}
    </div>
  );
};
