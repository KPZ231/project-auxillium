"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Rocket, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Globe,
  Briefcase
} from "lucide-react";
import { createSpace } from "@/actions/space";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const router = useRouter();

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!spaceName) {
      toast.error("Please name your space first!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("spaceName", spaceName);
    formData.append("spaceDescription", spaceDescription);

    try {
      const result = await createSpace(formData);
      if (result.success) {
        setStep(3); // Success step
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 relative">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl w-full space-y-16"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Welcome</p>
              <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.9]">
                CREATE YOUR<br/>FIRST SPACE.
              </h1>
            </div>
            
            <p className="text-slate-500 text-xl font-light max-w-xl leading-relaxed">
              Spaces allow you to isolate projects, leads, and team members. 
              Let's set up your first environment to get started.
            </p>

            <button
              onClick={() => setStep(2)}
              className="group px-12 py-5 bg-black text-white rounded-none font-bold text-sm uppercase tracking-[0.3em] hover:bg-slate-800 transition-colors"
            >
              Start Setup
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl w-full space-y-12"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Space Details</h2>
              <p className="text-slate-400 font-mono text-xs">Configure your workspace</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">Space Name</label>
                  <input
                    type="text"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    placeholder="e.g. Main Office"
                    className="w-full bg-transparent border-b border-black rounded-none px-0 py-4 text-xl font-bold placeholder:text-slate-200 focus:outline-none transition-all"
                  />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">Description</label>
                  <textarea
                    value={spaceDescription}
                    onChange={(e) => setSpaceDescription(e.target.value)}
                    placeholder="What is this space for?"
                    className="w-full bg-transparent border border-slate-200 rounded-none px-4 py-4 text-sm font-medium placeholder:text-slate-200 focus:border-black outline-none h-32 resize-none"
                  />
               </div>

               <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-8 py-4 border border-black rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-black text-white font-bold text-xs uppercase tracking-[0.4em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 disabled:opacity-30"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Space
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
               </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <CheckCircle2 className="w-16 h-16 text-black mx-auto" />
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Success</h2>
              <p className="text-slate-400 font-mono text-xs">Redirecting to your dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
