"use client";

import { motion, Variants } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getLeads } from "@/actions/getLeads";
import { reorderLeads } from "@/actions/reorderLeads";
import { toast } from "sonner";
import { Lead, LeadStatus } from "@/lib/generated/client/browser";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  Plus, 
  MoreHorizontal, 
} from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

interface LeadsGridProps {
  selectedFilter: string;
  view: "grid" | "list";
  sortBy: string;
  searchQuery: string;
}

const getStatusStyles = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.QUALIFIED:
      return "bg-black text-white";
    case LeadStatus.NEGOTIATION:
      return "bg-white text-gray-800 border border-gray-200";
    case LeadStatus.COLD:
      return "bg-gray-100 text-gray-400";
    default:
      return "bg-gray-100 text-gray-400";
  }
};

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="group relative h-full bg-white border border-gray-100 hover:border-black transition-all duration-300 shadow-sm hover:shadow-md flex flex-col overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-black text-black leading-tight uppercase tracking-tight line-clamp-2 pr-8">
            {lead.leadName}
          </h3>
          <span className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-widest ${getStatusStyles(lead.status)}`}>
            {lead.status}
          </span>
        </div>

        <div className="space-y-4">
          {/* Contact Person */}
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t("dashboard:leads.contact", "Contact")}</p>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{lead.contactName || t("dashboard:leads.unknown_contact", "Unknown Contact")}</span>
              <span className="text-[11px] text-gray-400">{lead.role || t("dashboard:leads.no_role", "No role specified")}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-gray-50 space-y-2">
            {lead.email && (
              <div className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                <Mail size={12} className="text-gray-300" />
                <span className="text-[11px] font-medium truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                <Phone size={12} className="text-gray-300" />
                <span className="text-[11px] font-medium">{lead.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-auto bg-gray-50/50 border-t border-gray-100 p-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t("dashboard:leads.stage", "Stage")}</p>
          <p className="text-[11px] font-mono text-gray-600">
            {lead.stage || t("dashboard:leads.discovery", "00 / Discovery")}
          </p>
        </div>
        <button 
          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-black transition-all"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Action Menu */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
          onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
          className="p-1 text-gray-300 hover:text-black"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}

export default function LeadsGrid({ selectedFilter, view, sortBy, searchQuery }: LeadsGridProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Drag and Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchLeadsData = async (force: boolean = false) => {
    if (!force) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const result = await getLeads(force);
      if (result.success && result.data) {
        setLeads(result.data as Lead[]);
      } else {
        toast.error(t("dashboard:leads.failed_load", "Failed to load leads"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("dashboard:leads.error_loading", "An error occurred while loading leads"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeadsData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchLeadsData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Filtering and Sorting logic
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Filter by status
    if (selectedFilter !== "ALL ACTIVE") {
      result = result.filter(lead => lead.status === selectedFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.leadName.toLowerCase().includes(query) ||
        (lead.contactName?.toLowerCase().includes(query)) ||
        (lead.email?.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === "Newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "Last Activity") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    // If sortBy is anything else (like "Manual Order"), we don't sort, 
    // respecting the order in the 'leads' state.

    return result;
  }, [leads, selectedFilter, sortBy, searchQuery]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyFilteredLeads = [...filteredLeads];
      const draggedItem = copyFilteredLeads[dragItem.current];
      const overItem = copyFilteredLeads[dragOverItem.current];

      if (!draggedItem || !overItem) {
        dragItem.current = null;
        dragOverItem.current = null;
        return;
      }

      // 1. Update local state (optimistic)
      // Find where they are in the main leads list
      setLeads(prev => {
        const newList = [...prev];
        const draggedIdx = newList.findIndex(l => l.id === draggedItem.id);
        const overIdxInMain = newList.findIndex(l => l.id === overItem.id);

        if (draggedIdx !== -1 && overIdxInMain !== -1) {
          const [removed] = newList.splice(draggedIdx, 1);
          const newOverIdx = newList.findIndex(l => l.id === overItem.id);
          const insertIdx = dragItem.current! < dragOverItem.current! ? newOverIdx + 1 : newOverIdx;
          newList.splice(insertIdx, 0, removed);
        }
        return newList;
      });

      // Prepare IDs for backend from the *next* state of leads
      // Since we can't wait for state, we calculate the order manually
      const currentLeads = [...leads];
      const dIdx = currentLeads.findIndex(l => l.id === draggedItem.id);
      const oIdx = currentLeads.findIndex(l => l.id === overItem.id);
      if (dIdx !== -1 && oIdx !== -1) {
        const [removed] = currentLeads.splice(dIdx, 1);
        const newOIdx = currentLeads.findIndex(l => l.id === overItem.id);
        const insIdx = dragItem.current! < dragOverItem.current! ? newOIdx + 1 : newOIdx;
        currentLeads.splice(insIdx, 0, removed);
      }
      
      const orderedIds = currentLeads.map(l => l.id);

      dragItem.current = null;
      dragOverItem.current = null;

      // Save to backend
      try {
        const result = await reorderLeads(orderedIds);
        if (!result.success) {
          toast.error(t("dashboard:leads.failed_save_order", "Failed to save lead order"));
          fetchLeadsData(true);
        }
      } catch (error) {
        console.error(error);
        toast.error(t("dashboard:leads.error_saving_order", "An error occurred while saving order"));
        fetchLeadsData(true);
      }
    } else {
      dragItem.current = null;
      dragOverItem.current = null;
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  if (isLoading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-[3px] border-black border-t-transparent rounded-full"
        />
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">{t("dashboard:leads.loading_leads", "Loading leads database...")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          {t("dashboard:leads.showing_leads", "Showing {{count}} Leads", { count: filteredLeads.length })}
        </h2>
        <button
          onClick={() => fetchLeadsData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:border-black transition-all disabled:opacity-50"
        >
          {isRefreshing ? (
             <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border-2 border-black border-t-transparent rounded-full"
           />
          ) : t("dashboard:leads.refresh_data", "Refresh Data")}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={view === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative" 
          : "flex flex-col gap-3 relative"
        }
      >
        {filteredLeads.map((lead, index) => (
          <motion.div
            key={lead.id}
            variants={itemVariants}
            draggable
            onDragStart={((e: React.DragEvent) => handleDragStart(e, index)) as any}
            onDragEnter={((e: React.DragEvent) => handleDragEnter(e, index)) as any}
            onDragEnd={handleDragEnd as any}
            onDragOver={((e: React.DragEvent) => e.preventDefault()) as any}
            className="h-full relative"
          >
            <LeadCard lead={lead} />
          </motion.div>
        ))}

        {/* Add Lead Card */}
        <motion.div
          variants={itemVariants}
          onClick={() => router.push("/dashboard/leads/new")}
          className="group cursor-pointer border border-dashed border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] gap-4"
        >
          <div className="w-12 h-12 bg-gray-100 group-hover:bg-black flex items-center justify-center transition-colors">
            <Plus className="text-gray-400 group-hover:text-white transition-colors" size={24} />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
            {t("dashboard:leads.manually_add_lead", "Manually Add Lead")}
          </p>
        </motion.div>
      </motion.div>

      {filteredLeads.length === 0 && (
        <div className="w-full py-20 text-center border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 font-medium">{t("dashboard:leads.no_leads_match", "No leads match your current filters.")}</p>
        </div>
      )}
    </div>
  );
}
