"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deleteProject } from "@/actions/deleteProject";
import { updateProject } from "@/actions/updateProject";
import { ProjectStatus } from "@/lib/generated/client/browser";
import { ImageUploader } from "@/app/components/UI/ImageUploader";
import Link from "next/link";
import Image from "next/image";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";

const STEPS = [
  "Basic Info",
  "Descriptions",
  "Logistics",
  "Links",
  "Milestones & Gallery"
];

export default function ProjectDetailsClient({ project, isUnauthorized = false }: { project: any, isUnauthorized?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel(project.projectName);
    // Cleanup: reset label when leaving page
    return () => setCustomLabel(null);
  }, [project.projectName, setCustomLabel]);




  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (searchParams.get("setup") === "true") {
      setIsSetupOpen(true);
      // Remove setup=true from URL without refreshing the page
      window.history.replaceState(null, '', `/dashboard/projects/${project.id}`);
    }
  }, [searchParams, project.id]);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  const [formData, setFormData] = useState({
    id: project.id,
    projectName: project.projectName,
    projectDescription: project.projectDescription,
    projectStatus: project.projectStatus,
    projectType: project.projectType || "",
    priority: project.priority || "",
    budget: project.budget || "",
    location: project.location || "",
    context: project.context || "",
    clientInfo: project.clientInfo || "",
    assignedUsersInfo: project.assignedUsersInfo || "",
    clientBrief: project.clientBrief || "",
    websiteUrl: project.websiteUrl || "",
    githubUrl: project.githubUrl || "",
    timeline: project.timeline || "",
    images: project.images || [],
    milestones: project.milestones || [],
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Handlers
  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteProject(project.id, deleteConfirmation);
    
    if (result.success) {
      toast.success("Project deleted successfully");
      router.push("/dashboard/projects");
    } else {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateProject(formData);

    if (result.success) {
      toast.success("Project updated successfully");
      setIsEditOpen(false);
      setIsSetupOpen(false);
      setCurrentStep(0);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== STEPS.length - 1) return; // Zapobiega zapisaniu przed końcem
    await handleEditSubmit(e);
  };

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", date: "", completed: false, progress: 0 }],
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...formData.milestones];
    newMilestones.splice(index, 1);
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));
  };

  // Stepper Rendering
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-4">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Name</label>
                <input type="text" required value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Status</label>
                <select value={formData.projectStatus} onChange={(e) => setFormData({...formData, projectStatus: e.target.value as any})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]">
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Type</label>
                <input type="text" placeholder="e.g. Residential, Web App, UI/UX" value={formData.projectType} onChange={(e) => setFormData({...formData, projectType: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]">
                  <option value="">Select priority...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-4">2. Context & Descriptions</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Main Description <span className="text-[#DC2626]">*</span></label>
                <textarea required rows={4} value={formData.projectDescription} onChange={(e) => setFormData({...formData, projectDescription: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" placeholder="Primary overview of the project..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Context</label>
                <textarea rows={3} value={formData.context} onChange={(e) => setFormData({...formData, context: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" placeholder="Background story, why we are doing this..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Client Brief Notes</label>
                <textarea rows={3} value={formData.clientBrief} onChange={(e) => setFormData({...formData, clientBrief: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" placeholder="Raw notes, requirements from the client..." />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-4">3. Logistics & Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Budget</label>
                <input type="text" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="e.g. €4.2M or 15000 PLN" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Timeline / ETA</label>
                <input type="text" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="e.g. Q3 2024" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="e.g. Copenhagen, DK" />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Client Name</label>
                <input type="text" value={formData.clientInfo} onChange={(e) => setFormData({...formData, clientInfo: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Assigned Team</label>
                <input type="text" value={formData.assignedUsersInfo} onChange={(e) => setFormData({...formData, assignedUsersInfo: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="e.g. John Doe (Lead), Anna Smith (Design)" />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-4">4. External Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Website URL</label>
                <input type="url" value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">GitHub URL</label>
                <input type="url" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" placeholder="https://github.com/..." />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-4">5. Milestones & Gallery</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">Milestones Roadmap</label>
                <button type="button" onClick={addMilestone} className="text-[12px] font-medium text-[#71717A] hover:text-[#0A0A0A]">+ Add Milestone</button>
              </div>
              {formData.milestones.length === 0 && <p className="text-[13px] text-[#71717A]">No milestones added yet.</p>}
              {formData.milestones.map((m: any, i: number) => (
                <div key={i} className="flex flex-col gap-3 bg-[#F4F4F5] p-3 border border-[#E5E5E5]">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={m.completed || m.progress === 100} onChange={(e) => {
                      updateMilestone(i, 'completed', e.target.checked);
                      if (e.target.checked) updateMilestone(i, 'progress', 100);
                    }} className="w-4 h-4 rounded-none accent-[#0A0A0A]" />
                    <input type="text" placeholder="Title (e.g. Design Phase)" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} className="flex-1 bg-transparent border-b border-[#D4D4D8] focus:border-[#0A0A0A] outline-none text-[13px]" />
                    <input type="text" placeholder="Date/ETA" value={m.date} onChange={(e) => updateMilestone(i, 'date', e.target.value)} className="w-24 bg-transparent border-b border-[#D4D4D8] focus:border-[#0A0A0A] outline-none text-[13px]" />
                    <button type="button" onClick={() => removeMilestone(i)} className="text-[#DC2626] font-bold text-[14px] hover:scale-110 transition-transform">✕</button>
                  </div>
                  <div className="flex items-center gap-3 pl-8 pr-2">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Progress</span>
                    <input type="range" min="0" max="100" value={m.progress || 0} onChange={(e) => updateMilestone(i, 'progress', parseInt(e.target.value))} className="flex-1 h-1 bg-[#D4D4D8] appearance-none cursor-pointer accent-[#0A0A0A]" />
                    <span className="text-[11px] font-bold text-[#0A0A0A] w-8 text-right">{m.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">Project Gallery</label>
              <ImageUploader images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Calculate overall progress
  const totalProgress = project.milestones && project.milestones.length > 0 
    ? Math.round(project.milestones.reduce((acc: number, m: any) => acc + (m.progress || (m.completed ? 100 : 0)), 0) / project.milestones.length)
    : 0;

  if (isUnauthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl text-center"
        >
          <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-4">Unauthorized Access</h2>
          <p className="text-[14px] text-[#71717A] mb-8">
            You do not have permission to view or edit this project. It may belong to another user.
          </p>
          <button 
            onClick={() => router.push("/dashboard/projects")}
            className="w-full h-12 bg-[#0A0A0A] text-[#FAFAFA] font-medium text-[13px] uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors"
          >
            Return to Projects
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#E5E5E5] pb-8">
        <div>
          <div className="flex gap-2 mb-4 items-center">
            <span className="inline-block px-2 py-1 bg-[#F4F4F5] text-[#0A0A0A] text-[10px] font-bold tracking-[0.08em] uppercase">
              {project.status}
            </span>
            <span className="inline-block px-2 py-1 bg-[#0A0A0A] text-white text-[10px] font-bold tracking-[0.08em] uppercase">
              {totalProgress}% COMPLETED
            </span>
            {project.priority && (
              <span className={`inline-block px-2 py-1 text-[10px] font-bold tracking-[0.08em] uppercase border ${
                project.priority === 'Critical' ? 'bg-[#DC2626] text-white border-[#DC2626]' :
                project.priority === 'High' ? 'bg-orange-500 text-white border-orange-500' :
                'bg-transparent text-[#0A0A0A] border-[#0A0A0A]'
              }`}>
                {project.priority} Priority
              </span>
            )}
            {project.projectType && (
              <span className="inline-block px-2 py-1 bg-transparent border border-[#E5E5E5] text-[#71717A] text-[10px] font-bold tracking-[0.08em] uppercase">
                {project.projectType}
              </span>
            )}
          </div>
          <h1 className="text-[40px] font-black tracking-tight leading-[1.1] text-[#0A0A0A] uppercase">
            {project.projectName}
          </h1>
          <p className="text-[14px] text-[#71717A] mt-2 font-mono">ID: {project.id}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-6 py-3 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors duration-200"
          >
            Edit Project
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-6 py-3 bg-transparent text-[#DC2626] text-[13px] font-medium tracking-[0.04em] uppercase border border-[#DC2626] hover:bg-[#DC2626] hover:text-[#FAFAFA] transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          
          <section>
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Description</h2>
            <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light">
              {project.projectDescription}
            </p>
          </section>

          {project.context && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Context</h2>
              <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light">
                {project.context}
              </p>
            </section>
          )}

          {project.clientBrief && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Client Brief</h2>
              <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light italic border-l-2 border-[#0A0A0A] pl-4">
                {project.clientBrief}
              </p>
            </section>
          )}

          {project.images && project.images.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E5E5]">
                {project.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-4/3 bg-white group overflow-hidden">
                    <Image src={img} alt={`${project.projectName} image ${i+1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.milestones && project.milestones.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Milestones & Progress</h2>
              
              <div className="mb-8">
                <div className="flex justify-between text-[11px] font-bold text-[#0A0A0A] mb-2 uppercase">
                  <span>Overall Progress</span>
                  <span>{totalProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#F4F4F5]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    className="h-full bg-[#0A0A0A]"
                  />
                </div>
              </div>

              <div className="space-y-6 border-l border-[#E5E5E5] pl-6">
                {project.milestones.map((m: any, i: number) => {
                  const isDone = m.completed || m.progress === 100;
                  return (
                    <div key={i} className="relative group">
                      <div className={`absolute left-[-29px] top-1.5 w-2 h-2 rounded-none border border-[#0A0A0A] transition-colors ${isDone ? 'bg-[#0A0A0A]' : 'bg-white group-hover:bg-[#E5E5E5]'}`} />
                      <div className="flex justify-between items-start">
                        <h3 className={`text-[14px] font-semibold ${isDone ? 'text-[#71717A] line-through' : 'text-[#0A0A0A]'}`}>{m.title}</h3>
                        <span className="text-[12px] font-bold text-[#0A0A0A]">{m.progress || 0}%</span>
                      </div>
                      {m.date && <p className="text-[12px] text-[#71717A] mt-1 mb-2">{m.date}</p>}
                      
                      <div className="w-full max-w-[250px] h-1 bg-[#F4F4F5] mt-1">
                        <div className={`h-full ${isDone ? 'bg-[#0A0A0A]' : 'bg-[#D4D4D8]'}`} style={{ width: `${m.progress || 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        <div className="space-y-8">
          <div className="p-6 border border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Logistics & Team</h2>
            
            <dl className="space-y-4">
              {project.budget && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Budget</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{project.budget}</dd>
                </div>
              )}
              {project.location && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Location</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{project.location}</dd>
                </div>
              )}
              {project.timeline && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Timeline</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{project.timeline}</dd>
                </div>
              )}
              {project.dueDate && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Due Date</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{new Date(project.dueDate).toLocaleDateString()}</dd>
                </div>
              )}
              {project.clientInfo && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Client</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{project.clientInfo}</dd>
                </div>
              )}
              {project.assignedUsersInfo && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Team</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{project.assignedUsersInfo}</dd>
                </div>
              )}
            </dl>
          </div>

          {(project.websiteUrl || project.githubUrl) && (
            <div className="p-6 border border-[#E5E5E5]">
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Links</h2>
              <div className="space-y-3">
                {project.websiteUrl && (
                  <Link href={project.websiteUrl} target="_blank" className="block text-[13px] text-[#0A0A0A] border-b border-[#0A0A0A] pb-1 w-max hover:text-[#71717A] hover:border-[#71717A] transition-colors">
                    Visit Website ↗
                  </Link>
                )}
                {project.githubUrl && (
                  <Link href={project.githubUrl} target="_blank" className="block text-[13px] text-[#0A0A0A] border-b border-[#0A0A0A] pb-1 w-max hover:text-[#71717A] hover:border-[#71717A] transition-colors">
                    GitHub Repository ↗
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl"
          >
            <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-2">Delete Project</h2>
            <p className="text-[14px] text-[#71717A] mb-6">
              This action cannot be undone. To verify, type <span className="font-bold text-[#0A0A0A]">{project.projectName}</span> below.
            </p>
            <input 
              type="text" 
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type project name..."
              className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#DC2626] focus:border-2 outline-none mb-6 text-[14px]"
            />
            <div className="flex gap-4">
              <button 
                onClick={handleDelete}
                disabled={deleteConfirmation !== project.projectName || isSubmitting}
                className="flex-1 h-10 bg-[#DC2626] text-white font-medium text-[13px] uppercase tracking-[0.04em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button 
                onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(""); }}
                className="flex-1 h-10 bg-transparent border border-[#E5E5E5] text-[#0A0A0A] font-medium text-[13px] uppercase tracking-[0.04em] hover:bg-[#F4F4F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Initial Setup Stepper Modal (WIZARD) */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-[#E5E5E5] shadow-2xl"
          >
            {/* Modal Header & Stepper Progress */}
            <div className="p-8 border-b border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Initial Project Setup</h2>
                  <p className="text-[12px] text-[#71717A] uppercase tracking-[0.08em] mt-1">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
                </div>
                <button onClick={() => setIsSetupOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A] text-xl">✕</button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2">
                {STEPS.map((_, idx) => (
                  <div key={idx} className="flex-1 h-1 bg-[#F4F4F5]">
                    <motion.div 
                      className="h-full bg-[#0A0A0A]" 
                      initial={{ width: "0%" }}
                      animate={{ width: idx <= currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stepper Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
              <form id="project-setup-form" onSubmit={handleSetupSubmit}>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </form>
            </div>

            {/* Modal Footer / Navigation */}
            <div className="p-6 border-t border-[#E5E5E5] bg-white flex justify-between items-center">
              <button 
                type="button" 
                onClick={prevStep} 
                disabled={currentStep === 0 || isSubmitting}
                className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]"
              >
                Back
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button 
                  type="submit" 
                  form="project-setup-form"
                  disabled={isSubmitting} 
                  className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Complete Setup"}
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}

      {/* Standard Edit Modal (SINGLE SCROLLABLE FORM) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E5E5] p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5] pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Edit Project</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A]">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-12">
              
              {/* Section 1 */}
              <section className="space-y-6">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Name</label>
                    <input type="text" required value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Status</label>
                    <select value={formData.projectStatus} onChange={(e) => setFormData({...formData, projectStatus: e.target.value as any})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]">
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Type</label>
                    <input type="text" value={formData.projectType} onChange={(e) => setFormData({...formData, projectType: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]">
                      <option value="">Select priority...</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-6">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Descriptions</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Description</label>
                    <textarea required rows={4} value={formData.projectDescription} onChange={(e) => setFormData({...formData, projectDescription: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Context</label>
                    <textarea rows={3} value={formData.context} onChange={(e) => setFormData({...formData, context: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Client Brief Notes</label>
                    <textarea rows={3} value={formData.clientBrief} onChange={(e) => setFormData({...formData, clientBrief: e.target.value})} className="w-full p-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px] resize-none" />
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-6">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Logistics & Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Budget</label>
                    <input type="text" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Timeline / ETA</label>
                    <input type="text" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Due Date</label>
                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Client Info</label>
                    <input type="text" value={formData.clientInfo} onChange={(e) => setFormData({...formData, clientInfo: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Website URL</label>
                    <input type="url" value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">GitHub URL</label>
                    <input type="url" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]" />
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-6">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Milestones & Media</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Milestones</label>
                    <button type="button" onClick={addMilestone} className="text-[12px] font-medium text-[#0A0A0A] hover:underline">+ Add</button>
                  </div>
                  {formData.milestones.map((m: any, i: number) => (
                    <div key={i} className="flex flex-col gap-3 bg-[#F4F4F5] p-3 border border-[#E5E5E5]">
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={m.completed || m.progress === 100} onChange={(e) => {
                          updateMilestone(i, 'completed', e.target.checked);
                          if (e.target.checked) updateMilestone(i, 'progress', 100);
                        }} className="w-4 h-4 rounded-none accent-[#0A0A0A]" />
                        <input type="text" placeholder="Title" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} className="flex-1 bg-transparent border-b border-[#D4D4D8] focus:border-[#0A0A0A] outline-none text-[13px]" />
                        <input type="text" placeholder="Date/ETA" value={m.date} onChange={(e) => updateMilestone(i, 'date', e.target.value)} className="w-24 bg-transparent border-b border-[#D4D4D8] focus:border-[#0A0A0A] outline-none text-[13px]" />
                        <button type="button" onClick={() => removeMilestone(i)} className="text-[#DC2626] font-bold text-[14px]">✕</button>
                      </div>
                      <div className="flex items-center gap-3 pl-8 pr-2">
                        <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Progress</span>
                        <input type="range" min="0" max="100" value={m.progress || 0} onChange={(e) => updateMilestone(i, 'progress', parseInt(e.target.value))} className="flex-1 h-1 bg-[#D4D4D8] appearance-none cursor-pointer accent-[#0A0A0A]" />
                        <span className="text-[11px] font-bold text-[#0A0A0A] w-8 text-right">{m.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Project Images</label>
                  <ImageUploader images={formData.images} onChange={(imgs) => setFormData({...formData, images: imgs})} />
                </div>
              </section>

              <div className="pt-8 border-t border-[#E5E5E5] flex justify-end gap-4 sticky bottom-0 bg-white pb-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
