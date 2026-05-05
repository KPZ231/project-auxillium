"use client";

import { motion, AnimatePresence, Variants } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { getLeads, forceRefreshLeads } from "@/actions/getLeads";
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
  User, 
  Briefcase 
} from "lucide-react";

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
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Contact</p>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{lead.contactName || "Unknown Contact"}</span>
              <span className="text-[11px] text-gray-400">{lead.role || "No role specified"}</span>
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
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Stage</p>
          <p className="text-[11px] font-mono text-gray-600">
            {lead.stage || "00 / Discovery"}
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
        toast.error("Failed to load leads");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading leads");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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
    result.sort((a, b) => {
      if (sortBy === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "Oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      // "Last Activity" - for now using updatedAt
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

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
      const copyLeads = [...filteredLeads];
      const dragItemContent = copyLeads[dragItem.current];
      copyLeads.splice(dragItem.current, 1);
      copyLeads.splice(dragOverItem.current, 0, dragItemContent);
      
      // Update local state (optimistic)
      // Note: This only updates the local filtered list, might need to update the main leads list too
      // for consistency if filters change right after.
      const updatedMainLeads = [...leads];
      // Find original indices and swap
      // Simple approach: replace the main leads with the reordered filtered list if no filters are active,
      // but if filters are active, it's complex.
      // Usually, DND is allowed only when no filters are active or we update based on IDs.
      
      setLeads(prev => {
        const newList = [...prev];
        const item = newList.find(l => l.id === dragItemContent.id);
        if (item) {
          // This is a simplified DND update for the full list
          // In a real app, we'd handle the indices carefully
          const oldIndex = newList.indexOf(item);
          newList.splice(oldIndex, 1);
          // Insert at the new relative position
          const targetItem = copyLeads[dragOverItem.current!];
          const targetIndexInMain = prev.findIndex(l => l.id === targetItem.id);
          newList.splice(targetIndexInMain, 0, item);
          return newList;
        }
        return prev;
      });

      dragItem.current = null;
      dragOverItem.current = null;

      // Save to backend
      const orderedIds = copyLeads.map(l => l.id);
      const result = await reorderLeads(orderedIds);
      if (!result.success) {
        toast.error("Failed to save lead order");
        fetchLeadsData(true); // Revert on failure
      }
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
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Loading leads database...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Showing {filteredLeads.length} Leads
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
          ) : "Refresh Data"}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={view === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "flex flex-col gap-3"
        }
      >
        {filteredLeads.map((lead, index) => (
          <motion.div
            key={lead.id}
            variants={itemVariants}
            draggable
            onDragStart={(e: any) => handleDragStart(e, index)}
            onDragEnter={(e: any) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e: any) => e.preventDefault()}
            className="h-full"
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
            Manually Add Lead
          </p>
        </motion.div>
      </motion.div>

      {filteredLeads.length === 0 && (
        <div className="w-full py-20 text-center border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 font-medium">No leads match your current filters.</p>
        </div>
      )}
    </div>
  );
}
