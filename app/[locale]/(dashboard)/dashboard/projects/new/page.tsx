"use client";
import { motion, Variants } from "motion/react";
import { addProject } from "@/actions/addProject";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ImageUploader } from "@/app/components/UI/ImageUploader";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { PremiumInput, PremiumTextarea } from "@/app/components/UI/FormElements";

export default function NewProject() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    projectStatus: "IN_PROGRESS" as "IN_PROGRESS" | "DONE" | "CANCELED",
    images: [] as string[],
    dueDate: "",
  });

  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel("New Project");
    return () => setCustomLabel(null);
  }, [setCustomLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await addProject(formData);
    
    if (result.success) {
      toast.success("Project created successfully!");
      router.push(`/dashboard/projects/${result.projectId}?setup=true`);
    } else {
      toast.error(result.error);
      console.error("Validation errors:", result.details);
    }
    
    setIsSubmitting(false);
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
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
            New Project
          </h1>
          <p className="mt-4 text-[#71717A] text-[16px] font-light leading-[1.65]">
            Add a new project to your portfolio. Keep it minimal.
          </p>
        </motion.div>

        <motion.form data-tutorial="project-form" variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
          
          <PremiumInput 
            label="Project Name" 
            required 
            value={formData.projectName} 
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} 
            placeholder="e.g. Minimalist Workspace"
            helperText="A clear, memorable name for your project."
          />

          <PremiumTextarea 
            label="Description" 
            required 
            rows={5} 
            value={formData.projectDescription} 
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} 
            placeholder="Describe the objective and outcome..."
            helperText="Provide a high-level overview."
          />

          <PremiumInput 
            label="Due Date" 
            type="date" 
            value={formData.dueDate} 
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
          />

          <div className="space-y-4 pt-4">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
              Project Images
            </label>
            <div className="bg-white border border-[#E5E5E5] p-6">
              <ImageUploader 
                images={formData.images} 
                onChange={handleImagesChange} 
              />
            </div>
          </div>

          <div className="pt-12 border-t border-[#F4F4F5]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[56px] px-12 bg-[#0A0A0A] text-[#FAFAFA] text-[14px] font-bold uppercase tracking-widest rounded-none hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border border-[#0A0A0A] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-xl"
            >
              {isSubmitting ? "Creating..." : "Initialize Project"}
            </button>
          </div>
          
        </motion.form>
      </motion.div>
    </div>
  );
}
