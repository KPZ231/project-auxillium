"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deleteProject } from "@/actions/deleteProject";
import { updateProject } from "@/actions/updateProject";
import { ImageUploader } from "@/app/components/UI/ImageUploader";
import Link from "next/link";
import Image from "next/image";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { AssignmentManager } from "@/app/components/assignments/assignment-manager";
import { PremiumInput, PremiumTextarea, PremiumSelect } from "@/app/components/UI/FormElements";
import { ComboboxInput } from "@/app/components/UI/ComboboxInput";
import { RelatedDocuments } from "@/app/components/templates/RelatedDocuments";
import {
  PROJECT_TYPE_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/predefined-data";

const STEPS = [
  "Basic Info",
  "Descriptions",
  "Logistics",
  "Links",
  "Milestones & Gallery",
  "Review & Confirm",
];

interface Milestone {
  title: string;
  date: string;
  completed: boolean;
  progress: number;
}

interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  projectStatus: "DONE" | "IN_PROGRESS" | "CANCELED";
  projectType?: string | null;
  priority?: string | null;
  budget?: string | null;
  location?: string | null;
  context?: string | null;
  clientInfo?: string | null;
  assignedUsersInfo?: string | null;
  clientBrief?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  timeline?: string | null;
  images: string[];
  milestones: Milestone[];
  dueDate?: string | Date;
  assignedEmployees: Array<{ id: string; name: string; avatarUrl?: string }>,
  status: string;
}

// Inline summary field component for review step
const SField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="p-4 bg-white">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">{label}</p>
      <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-2">{value}</p>
    </div>
  );
};

export default function ProjectDetailsClient({
  project,
  isUnauthorized = false,
  spaceId
}: {
  project: Project,
  isUnauthorized?: boolean,
  spaceId: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel(project.projectName);
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
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [formData, setFormData] = useState({
    id: project.id,
    projectName: project.projectName,
    projectDescription: project.projectDescription,
    projectStatus: project.projectStatus as "DONE" | "IN_PROGRESS" | "CANCELED",
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
    if (currentStep !== STEPS.length - 1) return;
    await handleEditSubmit(e);
  };

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", date: "", completed: false, progress: 0 }],
    }));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | boolean | number) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value } as Milestone;
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));
  };

  const removeMilestone = (index: number) => {
    const newMilestones = [...formData.milestones];
    newMilestones.splice(index, 1);
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">1. Basic Information</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">The core identity of your project — start here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <PremiumInput
                label="Project Name"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Urban Minimalist Retreat"
                helperText="A clear, memorable name your team will immediately recognize."
              />
              <PremiumSelect
                label="Status"
                value={formData.projectStatus}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as "IN_PROGRESS" | "DONE" | "CANCELED" })}
                options={[
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "DONE", label: "Done" },
                  { value: "CANCELED", label: "Canceled" }
                ]}
                helperText="Reflects the current lifecycle stage of the project."
              />
              <ComboboxInput
                label="Project Type"
                value={formData.projectType}
                onChange={(val) => setFormData({ ...formData, projectType: val })}
                options={PROJECT_TYPE_OPTIONS}
                placeholder="e.g. Web Development"
                helperText="The primary discipline or category this project falls under. Used for filtering and reporting."
                tooltip="Helps you group projects by kind of work — e.g. all 'Architecture' projects together. Pick from suggestions or type your own."
              />
              <PremiumSelect
                label="Priority Level"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: "", label: "Select priority..." },
                  { value: "Low", label: "Low — nice to have, no deadline pressure" },
                  { value: "Medium", label: "Medium — standard priority" },
                  { value: "High", label: "High — time-sensitive, needs attention" },
                  { value: "Critical", label: "Critical — urgent, drop everything" }
                ]}
                helperText="How urgent and important this project is relative to others."
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">2. Narrative & Context</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Define the &quot;why&quot; and &quot;how&quot; — captured in your own words.</p>
            </div>

            <div className="space-y-10">
              <PremiumTextarea
                label="Main Description"
                required
                rows={4}
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="High-level summary of the goals, scope, and expected outcome..."
                helperText="This is the primary text shown on the project page. Aim for 2–4 sentences covering what's being built, for whom, and why."
              />
              <PremiumTextarea
                label="Project Context"
                rows={3}
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Background story, constraints, or specific challenges the team should know about..."
                helperText="Optional backstory. Useful for onboarding new team members or explaining why certain decisions were made."
              />
              <PremiumTextarea
                label="Client Brief Notes"
                rows={3}
                value={formData.clientBrief}
                onChange={(e) => setFormData({ ...formData, clientBrief: e.target.value })}
                placeholder="Key instructions, preferences, or verbatim requests from the client..."
                helperText="Direct client feedback or requirements. Stored separately from the description so it's easy to reference."
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">3. Logistics & Resources</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Numbers, people, and practicalities that drive delivery.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <ComboboxInput
                label="Budget"
                value={formData.budget}
                onChange={(val) => setFormData({ ...formData, budget: val })}
                options={BUDGET_OPTIONS}
                placeholder="e.g. 50,000 – 150,000 PLN"
                helperText="The agreed or estimated budget. Use a range if no fixed amount is confirmed yet."
                tooltip="Used for financial reporting and capacity planning. You can enter an exact figure or choose a predefined range."
              />
              <ComboboxInput
                label="Timeline / ETA"
                value={formData.timeline}
                onChange={(val) => setFormData({ ...formData, timeline: val })}
                options={TIMELINE_OPTIONS}
                placeholder="e.g. 6 Months"
                helperText="Estimated duration from kickoff to final delivery."
                tooltip="How long the project is expected to run. Differs from Due Date — this is a duration, not a calendar date."
              />
              <PremiumInput
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                helperText="The hard deadline for final delivery. Shown in project dashboards and overdue alerts."
              />
              <ComboboxInput
                label="Location"
                value={formData.location}
                onChange={(val) => setFormData({ ...formData, location: val })}
                options={LOCATION_OPTIONS}
                placeholder="e.g. Warsaw, Poland"
                helperText="Where the project is physically based, or select 'Remote' for fully distributed work."
                tooltip="Used for grouping projects by geography and for client-facing project pages."
              />
              <PremiumInput
                label="Client Name"
                value={formData.clientInfo}
                onChange={(e) => setFormData({ ...formData, clientInfo: e.target.value })}
                placeholder="Company or individual commissioning this project"
                helperText="The name of the client or organisation paying for this work."
              />

              <div className="md:col-span-2 pt-10 border-t border-[#E5E5E5]">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A] mb-2">Assign Team Members</label>
                <p className="text-[11px] text-[#A1A1AA] italic mb-6">Choose which employees from your space are responsible for this project.</p>
                <div className="bg-white border border-[#E5E5E5] p-6 shadow-sm">
                  <AssignmentManager
                    entityId={project.id}
                    entityType="project"
                    initialMembers={project.assignedEmployees || []}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">4. External Connections</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Link this project to the digital world.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <PremiumInput
                label="Website URL"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://project-live-link.com"
                helperText="A public URL where the live version of this project can be viewed or demoed."
              />
              <PremiumInput
                label="GitHub URL"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/org/repo"
                helperText="The source code repository. Useful for dev teams to jump straight to the codebase."
              />
            </div>

            <div className="p-4 bg-[#F8F8F8] border border-[#E5E5E5] border-l-4 border-l-[#D4D4D8]">
              <p className="text-[11px] text-[#71717A]">
                <span className="font-bold text-[#0A0A0A]">Skip if not applicable.</span>{" "}
                Links are optional — you can always add them later from the project page.
              </p>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">5. Milestones & Assets</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Lay out the roadmap and upload visuals.</p>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center border-b-2 border-[#0A0A0A] pb-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Roadmap Milestones</label>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1">Key checkpoints or deliverables with progress tracking.</p>
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#FAFAFA] hover:text-[#0A0A0A] border border-[#0A0A0A] transition-all"
                >
                  + Add Milestone
                </button>
              </div>

              {formData.milestones.length === 0 && (
                <div className="py-12 text-center border border-dashed border-[#D4D4D8]">
                  <p className="text-[12px] text-[#71717A] uppercase tracking-widest">No milestones yet — add one above.</p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-2">e.g. "Design Handover", "Alpha Release", "Client Sign-off"</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.milestones.map((m: Milestone, i: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className="group relative bg-white p-6 border border-[#E5E5E5] transition-all hover:border-[#0A0A0A]"
                  >
                    <div className="flex items-start gap-6">
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={m.completed || m.progress === 100}
                          onChange={(e) => {
                            updateMilestone(i, 'completed', e.target.checked);
                            if (e.target.checked) updateMilestone(i, 'progress', 100);
                          }}
                          className="w-5 h-5 rounded-none accent-[#0A0A0A] border-2 border-[#D4D4D8] cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <PremiumInput
                            label="Title"
                            placeholder="e.g. Design Handover"
                            value={m.title}
                            onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <PremiumInput
                            label="Target Date"
                            placeholder="Q4 2024"
                            value={m.date}
                            onChange={(e) => updateMilestone(i, 'date', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => removeMilestone(i)}
                            className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-6 pl-11">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Completion Progress</span>
                          <span className="text-[11px] font-black text-[#0A0A0A]">{m.progress || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={m.progress || 0}
                          onChange={(e) => updateMilestone(i, 'progress', parseInt(e.target.value))}
                          className="w-full h-1 bg-[#F4F4F5] appearance-none cursor-pointer accent-[#0A0A0A]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-[#0A0A0A]">
              <div>
                <label className="block text-[12px] font-black uppercase tracking-[0.15em] text-[#0A0A0A] mb-1">Project Gallery</label>
                <p className="text-[11px] text-[#A1A1AA] italic mb-4">Upload renders, screenshots, or reference images for this project.</p>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-8">
                <ImageUploader images={formData.images} onChange={(imgs) => setFormData({ ...formData, images: imgs })} />
              </div>
            </div>
          </motion.div>
        );

      case 5: {
        const requiredFilled = formData.projectName.trim() && formData.projectDescription.trim();
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">Review & Confirm</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Verify everything looks right before saving.</p>
            </div>

            <div className="border border-[#E5E5E5] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5]">
                <SField label="Project Name" value={formData.projectName} />
                <SField label="Status" value={formData.projectStatus} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Type" value={formData.projectType} />
                <SField label="Priority" value={formData.priority} />
              </div>
              {formData.projectDescription && (
                <div className="border-t border-[#E5E5E5] p-4 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Description</p>
                  <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-3">{formData.projectDescription}</p>
                </div>
              )}
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Budget" value={formData.budget} />
                <SField label="Timeline" value={formData.timeline} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Due Date" value={formData.dueDate} />
                <SField label="Location" value={formData.location} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Client" value={formData.clientInfo} />
                <div className="p-4 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Milestones</p>
                  <p className="text-[13px] text-[#0A0A0A] font-medium">{formData.milestones.length > 0 ? `${formData.milestones.length} defined` : "None"}</p>
                </div>
              </div>
              {(formData.websiteUrl || formData.githubUrl) && (
                <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                  <SField label="Website" value={formData.websiteUrl} />
                  <SField label="GitHub" value={formData.githubUrl} />
                </div>
              )}
            </div>

            <div className={`p-4 border-l-4 ${requiredFilled ? "border-l-[#16A34A] bg-[#F0FDF4]" : "border-l-[#DC2626] bg-[#FEF2F2]"}`}>
              {requiredFilled ? (
                <p className="text-[12px] text-[#166534] font-medium">
                  ✓ All required fields filled. Click <strong>Complete Setup</strong> to save your project.
                </p>
              ) : (
                <p className="text-[12px] text-[#991B1B] font-medium">
                  ✗ <strong>Project Name</strong> and <strong>Description</strong> are required. Go back to fill them in.
                </p>
              )}
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  const totalProgress = project.milestones && project.milestones.length > 0
    ? Math.round(project.milestones.reduce((acc: number, m: Milestone) => acc + (m.progress || (m.completed ? 100 : 0)), 0) / project.milestones.length)
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
              <span className={`inline-block px-2 py-1 text-[10px] font-bold tracking-[0.08em] uppercase border ${project.priority === 'Critical' ? 'bg-[#DC2626] text-white border-[#DC2626]' :
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

      {/* Main Content */}
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
                    <Image src={img} alt={`${project.projectName} image ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                {project.milestones.map((m: Milestone, i: number) => {
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
              <div className="pt-4 border-t border-[#E5E5E5]">
                <AssignmentManager
                  entityId={project.id}
                  entityType="project"
                  initialMembers={project.assignedEmployees || []}
                />
              </div>
            </dl>
          </div>

          <div className="p-6 border border-[#E5E5E5]">
            <RelatedDocuments spaceId={spaceId} projectId={project.id} />
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
            <PremiumInput
              label="Project Name Verification"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type project name..."
              className="mb-6"
              error={deleteConfirmation && deleteConfirmation !== project.projectName ? "Name mismatch" : ""}
            />
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== project.projectName || isSubmitting}
                className="flex-1 h-12 bg-[#DC2626] text-white font-bold text-[11px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(""); }}
                className="flex-1 h-12 bg-transparent border border-[#E5E5E5] text-[#0A0A0A] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F4F4F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Setup Stepper Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-[#E5E5E5] shadow-2xl"
          >
            <div className="p-8 border-b border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Initial Project Setup</h2>
                  <p className="text-[12px] text-[#71717A] uppercase tracking-[0.08em] mt-1">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
                </div>
                <button onClick={() => setIsSetupOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A] text-xl">✕</button>
              </div>
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

            <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAFAFA]">
              <form id="project-setup-form" onSubmit={handleSetupSubmit}>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </form>
            </div>

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

      {/* Edit Modal */}
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
              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput
                    label="Project Name"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    helperText="A clear, memorable name your team will immediately recognize."
                  />
                  <PremiumSelect
                    label="Status"
                    value={formData.projectStatus}
                    onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as "IN_PROGRESS" | "DONE" | "CANCELED" })}
                    options={[
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "DONE", label: "Done" },
                      { value: "CANCELED", label: "Canceled" }
                    ]}
                  />
                  <ComboboxInput
                    label="Project Type"
                    value={formData.projectType}
                    onChange={(val) => setFormData({ ...formData, projectType: val })}
                    options={PROJECT_TYPE_OPTIONS}
                    placeholder="e.g. Web Development"
                    helperText="Primary discipline or category."
                    tooltip="Choose from suggestions or type your own value."
                  />
                  <PremiumSelect
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={[
                      { value: "", label: "Select priority..." },
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                      { value: "Critical", label: "Critical" }
                    ]}
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Descriptions</h3>
                </div>
                <div className="space-y-8">
                  <PremiumTextarea label="Description" required rows={4} value={formData.projectDescription} onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} helperText="High-level summary of goals and expected outcomes." />
                  <PremiumTextarea label="Context" rows={3} value={formData.context} onChange={(e) => setFormData({ ...formData, context: e.target.value })} helperText="Background, constraints, or situational details." />
                  <PremiumTextarea label="Client Brief Notes" rows={3} value={formData.clientBrief} onChange={(e) => setFormData({ ...formData, clientBrief: e.target.value })} helperText="Direct client feedback or specific requirements." />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Logistics & Links</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ComboboxInput label="Budget" value={formData.budget} onChange={(val) => setFormData({ ...formData, budget: val })} options={BUDGET_OPTIONS} placeholder="e.g. 50,000 – 150,000 PLN" helperText="Agreed or estimated budget." tooltip="Use predefined ranges or type an exact amount." />
                  <ComboboxInput label="Timeline / ETA" value={formData.timeline} onChange={(val) => setFormData({ ...formData, timeline: val })} options={TIMELINE_OPTIONS} placeholder="e.g. 6 Months" helperText="Estimated project duration." />
                  <PremiumInput label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} helperText="Hard deadline for final delivery." />
                  <ComboboxInput label="Location" value={formData.location} onChange={(val) => setFormData({ ...formData, location: val })} options={LOCATION_OPTIONS} placeholder="e.g. Warsaw, Poland" helperText="Where the project is based." />
                  <PremiumInput label="Client Name" value={formData.clientInfo} onChange={(e) => setFormData({ ...formData, clientInfo: e.target.value })} helperText="Company or individual commissioning this work." />
                  <PremiumInput label="Website URL" type="url" value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} />
                  <PremiumInput label="GitHub URL" type="url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} />
                  <div className="md:col-span-2 pt-6">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A] mb-4">Assign Team Members</label>
                    <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6 shadow-sm">
                      <AssignmentManager
                        entityId={project.id}
                        entityType="project"
                        initialMembers={project.assignedEmployees || []}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] border-b border-[#E5E5E5] pb-2">Milestones & Media</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#71717A]">Milestones</label>
                    <button type="button" onClick={addMilestone} className="text-[12px] font-medium text-[#0A0A0A] hover:underline">+ Add</button>
                  </div>
                  {formData.milestones.map((m: { title: string; date: string; completed?: boolean; progress?: number }, i: number) => (
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
                  <ImageUploader images={formData.images} onChange={(imgs) => setFormData({ ...formData, images: imgs })} />
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
