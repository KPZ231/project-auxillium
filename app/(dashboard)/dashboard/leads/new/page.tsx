"use client";
import { motion, Variants } from "motion/react";
import { addLead } from "@/actions/addLead";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useEffect } from "react";
import { PremiumInput, PremiumTextarea } from "@/app/components/UI/FormElements";
import { AddLeadInput } from "@/actions/addLead";

export default function NewLead() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddLeadInput>({
    leadName: "",
    leadInfo: "",
  });

  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel("New Lead");
    return () => setCustomLabel(null);
  }, [setCustomLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await addLead(formData);
    
    if (result.success) {
      toast.success("Lead created successfully!");
      router.push(`/dashboard/leads/${result.leadId}?setup=true`);
    } else {
      toast.error(result.error);
      console.error("Validation errors:", result.details);
    }
    
    setIsSubmitting(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 md:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-[40px] leading-[1.1] font-bold text-[#0A0A0A] tracking-tight">
            New Lead
          </h1>
          <p className="mt-4 text-[#71717A] text-[16px] font-light leading-[1.65]">
            Add a new business opportunity. Keep it minimal.
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
          
          <PremiumInput 
            label="Lead / Company Name" 
            required 
            value={formData.leadName} 
            onChange={(e) => setFormData({ ...formData, leadName: e.target.value })} 
            placeholder="e.g. Acme Corp"
            helperText="The name of the company or individual."
          />

          <PremiumTextarea 
            label="Description / Notes" 
            required 
            rows={5} 
            value={formData.leadInfo} 
            onChange={(e) => setFormData({ ...formData, leadInfo: e.target.value })} 
            placeholder="Describe the opportunity..."
            helperText="Brief summary of why this lead is important."
          />

          <div className="pt-12 border-t border-[#F4F4F5]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[56px] px-12 bg-[#0A0A0A] text-[#FAFAFA] text-[14px] font-bold uppercase tracking-widest rounded-none hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border border-[#0A0A0A] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-xl"
            >
              {isSubmitting ? "Creating..." : "Initialize Lead"}
            </button>
          </div>
          
        </motion.form>
      </motion.div>
    </div>
  );
}

