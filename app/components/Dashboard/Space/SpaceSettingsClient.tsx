"use client";

import React, { useState } from "react";
import { createSpace, switchSpace } from "@/actions/space";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck,
  Calendar,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Space {
  id: string;
  spaceName: string;
  _count?: {
    members: number;
    projects: number;
  };
}

interface SpaceSettingsClientProps {
  initialSpaces: Space[];
  activeSpaceId: string | undefined;
  activeSpace: {
    id: string;
    spaceName: string;
    spaceDescription?: string | null;
    owner: { name: string | null };
    createdAt: Date | string;
  } | null;
}

export default function SpaceSettingsClient({ initialSpaces, activeSpaceId, activeSpace }: SpaceSettingsClientProps) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreateSpace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createSpace(formData);
      if (result.success) {
        toast.success("Space created successfully!");
        setSpaces([...spaces, result.space]);
        setIsCreating(false);
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create space");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchSpace = async (id: string) => {
    if (id === activeSpaceId) return;
    
    try {
      const result = await switchSpace(id);
      if (result.success) {
        toast.success("Switched space successfully");
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to switch space");
    }
  };

  return (
    <div className="space-y-24">
      {/* ACTIVE SPACE INFO */}
      {activeSpace && (
        <section className="bg-black p-16 text-white">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                 <div className="w-24 h-24 bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <Building2 className="w-10 h-10" />
                 </div>
                 <div className="space-y-4 text-center md:text-left">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em] font-mono">ACTIVE_SPACE</span>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">{activeSpace.spaceName}</h2>
                    <p className="text-white/60 font-medium max-w-xl text-lg leading-relaxed">{activeSpace.spaceDescription || "No description provided."}</p>
                 </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4 font-mono text-[10px] text-white/30 uppercase">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> OWNER: {activeSpace.owner.name || "Owner"}
                 </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> CREATED: {new Date(activeSpace.createdAt).toLocaleDateString()}
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* SPACE LIST */}
      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-black pb-6">
           <h3 className="text-xl font-black text-black tracking-tighter uppercase">Available Spaces</h3>
           <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all"
           >
             <Plus className="w-4 h-4" /> New Space
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-slate-200">
           {spaces.map((space) => (
             <button
                key={space.id}
                onClick={() => handleSwitchSpace(space.id)}
                className={`flex items-center justify-between p-10 border-r border-b border-slate-200 transition-all text-left group ${
                  space.id === activeSpaceId 
                  ? "bg-black text-white" 
                  : "bg-white hover:bg-slate-50"
                }`}
             >
                <div className="flex items-center gap-8">
                   <div className={`w-14 h-14 flex items-center justify-center transition-colors ${
                     space.id === activeSpaceId ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400"
                   }`}>
                      <Building2 className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase tracking-tighter">{space.spaceName}</h4>
                      <p className={`text-[9px] font-bold uppercase tracking-[0.3em] font-mono ${
                        space.id === activeSpaceId ? "text-white/40" : "text-slate-400"
                      }`}>
                        {space._count?.members || 0} Members / {space._count?.projects || 0} Projects
                      </p>
                   </div>
                </div>
                {space.id === activeSpaceId ? (
                   <CheckCircle2 className="w-6 h-6 text-white" />
                ) : (
                   <div className="w-10 h-10 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                )}
             </button>
           ))}
        </div>
      </section>

      {/* CREATE MODAL */}
      <AnimatePresence>
         {isCreating && (
           <div className="fixed inset-0 z-100 flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsCreating(false)}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                className="relative w-full max-w-xl bg-white border border-black p-16"
              >
                 <div className="space-y-2 mb-12">
                   <h3 className="text-4xl font-black text-black uppercase tracking-tighter">New Space</h3>
                   <p className="text-slate-400 font-mono text-[10px]">Create Workspace</p>
                 </div>
                 
                 <form onSubmit={handleCreateSpace} className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-black uppercase tracking-[0.4em]">Space Name</label>
                       <input 
                          name="spaceName" 
                          required
                          className="w-full px-0 py-4 bg-transparent border-b border-slate-200 focus:border-black rounded-none text-xl font-bold placeholder:text-slate-200 focus:outline-none transition-all"
                          placeholder="e.g. Marketing"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-black uppercase tracking-[0.4em]">Description</label>
                       <textarea 
                          name="spaceDescription"
                          className="w-full px-4 py-4 bg-transparent border border-slate-200 rounded-none text-sm font-medium placeholder:text-slate-200 focus:border-black outline-none h-32 resize-none"
                          placeholder="Space description..."
                       />
                    </div>
                    <div className="pt-8 flex gap-4">
                       <button 
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        className="px-8 py-5 border border-black text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                       >
                         Cancel
                       </button>
                       <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-5 bg-black text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                       >
                         {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Space"}
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
