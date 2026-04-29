"use client";
import { motion, Variants } from "motion/react";
import { addProject } from "@/actions/addProject";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/app/components/UI/ImageUploader";

export default function NewProject() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    projectStatus: "IN_PROGRESS" as "IN_PROGRESS" | "DONE" | "CANCELED",
    images: [] as string[],
  });

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

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label htmlFor="projectName" className="block text-[14px] font-medium text-[#0A0A0A]">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full h-[40px] px-3 bg-white text-[#0A0A0A] text-[14px] border border-[#D4D4D8] rounded-none outline-none focus:border-[#0A0A0A] focus:border-2 transition-all duration-200"
              placeholder="e.g. Minimalist Workspace"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="projectDescription" className="block text-[14px] font-medium text-[#0A0A0A]">
              Description
            </label>
            <textarea
              id="projectDescription"
              required
              rows={5}
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              className="w-full p-3 bg-white text-[#0A0A0A] text-[14px] border border-[#D4D4D8] rounded-none outline-none focus:border-[#0A0A0A] focus:border-2 transition-all duration-200 resize-none"
              placeholder="Describe the objective and outcome..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#0A0A0A]">
              Project Images
            </label>
            <ImageUploader 
              images={formData.images} 
              onChange={handleImagesChange} 
            />
          </div>

          <div className="pt-8 border-t border-[#F4F4F5]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[48px] px-8 bg-[#0A0A0A] text-[#FAFAFA] text-[16px] font-medium rounded-none hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Create Project"}
            </button>
          </div>
          
        </motion.form>
      </motion.div>
    </div>
  );
}
