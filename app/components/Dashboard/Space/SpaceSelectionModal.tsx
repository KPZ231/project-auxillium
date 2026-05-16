"use client";

import React, { useState } from "react";
import { switchSpace } from "@/actions/space";
import { motion } from "motion/react";
import { 
  Building2, 
  ChevronRight, 
  Loader2,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/logout";

interface SpaceSelectionModalProps {
  spaces: {
    id: string;
    spaceName: string;
    _count?: {
      members: number;
      projects: number;
    };
  }[];
}

export default function SpaceSelectionModal({ spaces }: SpaceSelectionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSwitchSpace = async (id: string) => {
    setIsSubmitting(true);
    try {
      const result = await switchSpace(id);
      if (result.success) {
        toast.success("Space activated");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate space");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
      await logoutAction();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white border border-black shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Activation Required</p>
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">
              Select your<br/>workspace
            </h2>
            <p className="text-slate-500 text-sm max-w-md">
              Please choose a workspace to continue. Your last session has expired or no space was active.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 border border-slate-200">
            {spaces.map((space) => (
              <button
                key={space.id}
                disabled={isSubmitting}
                onClick={() => handleSwitchSpace(space.id)}
                className="flex items-center justify-between p-6 md:p-8 bg-white hover:bg-slate-50 transition-all text-left group border-b border-slate-200 last:border-0 disabled:opacity-50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-colors">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black uppercase tracking-tighter">{space.spaceName}</h4>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">
                      {space._count?.members || 0} Members / {space._count?.projects || 0} Projects
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
             <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-[0.2em] transition-colors"
             >
                <LogOut className="w-3 h-3" /> Logout
             </button>
             {isSubmitting && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-black uppercase tracking-[0.2em]">
                   <Loader2 className="w-3 h-3 animate-spin" /> Activating...
                </div>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
