"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deleteClient, updateClient } from "@/actions/clients";
import { ImageUploader } from "@/app/components/UI/ImageUploader";
import Link from "next/link";
import Image from "next/image";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { AssignmentManager } from "@/app/components/assignments/assignment-manager";
import { PremiumInput, PremiumTextarea } from "@/app/components/UI/FormElements";
import { ComboboxInput } from "@/app/components/UI/ComboboxInput";
import { RelatedDocuments } from "@/app/components/templates/RelatedDocuments";
import {
  TIMELINE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/lib/predefined-data";

const STEPS = [
  "Basic Info",
  "Narrative & Context",
  "Logistics & HR",
  "Gallery & Timelines",
  "Review & Confirm",
];

interface Milestone {
  title: string;
  date: string;
  completed: boolean;
  progress: number;
}

interface Member {
  id: string;
  name: string;
  role?: string | null;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
  notes?: string | null;
  location?: string | null;
  photoUrl?: string | null;
  timeline?: string | null;
  milestones: Milestone[];
  schedule: unknown[];
  assignedEmployees: Member[];
  incomes: { amount: number; date: string; description: string; source: string }[];
  expenses: { amount: number; date: string; description: string; category: string }[];
  projects: { id: string; projectName: string; projectStatus: string }[];
  spaceId: string;
  userId: string;
}

const SField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="p-4 bg-white">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">{label}</p>
      <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-2">{value}</p>
    </div>
  );
};

export default function ClientDetailsClient({
  client,
  isUnauthorized = false,
  spaceId
}: {
  client: Client,
  isUnauthorized?: boolean,
  spaceId: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel(client.name);
    return () => setCustomLabel(null);
  }, [client.name, setCustomLabel]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [financeType, setFinanceType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [financeData, setFinanceData] = useState({
    amount: "",
    description: "",
    source: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (searchParams.get("setup") === "true") {
      setIsSetupOpen(true);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [formData, setFormData] = useState({
    id: client.id,
    name: client.name,
    email: client.email || "",
    phone: client.phone || "",
    description: client.description || "",
    notes: client.notes || "",
    location: client.location || "",
    photoUrl: client.photoUrl || "",
    timeline: client.timeline || "",
    milestones: client.milestones || [],
    schedule: client.schedule || [],
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteClient(client.id, deleteConfirmation);
    if (result.success) {
      toast.success("Client deleted successfully");
      router.push("/dashboard/clients");
    } else {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const result = await updateClient(formData);
    if (result.success) {
      toast.success("Client updated successfully");
      setIsEditOpen(false);
      setIsSetupOpen(false);
      setCurrentStep(0);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { addIncome, addExpense } = await import("@/actions/finance");
    const payload = {
      amount: parseFloat(financeData.amount),
      description: financeData.description,
      date: new Date(financeData.date),
      spaceId: client.spaceId || "",
      userId: client.userId,
      clientId: client.id,
      ...(financeType === "INCOME" ? { source: financeData.source } : { category: financeData.category || undefined })
    };
    const result = financeType === "INCOME"
      ? await addIncome(payload as any)
      : await addExpense(payload as any);
    if (result.success) {
      toast.success(`${financeType === "INCOME" ? "Income" : "Expense"} added successfully`);
      setIsFinanceOpen(false);
      setFinanceData({ amount: "", description: "", source: "", category: "", date: new Date().toISOString().split('T')[0] });
      router.refresh();
    } else {
      toast.error(result.error || "Failed to add record");
    }
    setIsSubmitting(false);
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== STEPS.length - 1) return;
    await handleEditSubmit();
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
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Core contact details — who this client is and how to reach them.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <PremiumInput
                label="Client Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Acme Corp"
                helperText="The full name of the company or individual. This appears in all reports and project links."
              />
              <PremiumInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. hello@acmecorp.com"
                helperText="Primary contact email. Used for notifications and communication logs."
              />
              <PremiumInput
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +48 123 456 789"
                helperText="Main phone number. Include the country code for international clients."
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">2. Narrative & Context</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Who are they — and what should your team know about them?</p>
            </div>

            <div className="space-y-10">
              <PremiumTextarea
                label="Description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="General overview: what does this client do, what's their business, who are they in the market..."
                helperText="A public-facing description shown on the client profile. 2–4 sentences is ideal."
              />
              <PremiumTextarea
                label="Internal Notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal only: communication preferences, past friction points, decision-maker names, quirks..."
                helperText="Visible only to your team. A great place to capture context before meetings."
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">3. Logistics & HR</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Where they are and who on your team looks after them.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <ComboboxInput
                label="Location / Address"
                value={formData.location}
                onChange={(val) => setFormData({ ...formData, location: val })}
                options={LOCATION_OPTIONS}
                placeholder="e.g. Warsaw, Poland"
                helperText="The client's primary business location. Shown on a map on the client page."
                tooltip="If the client operates remotely, you can type 'Remote'. For office-based clients, enter their city or full address."
              />

              <div className="md:col-span-2 pt-10 border-t border-[#E5E5E5]">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A] mb-2">Assigned Employees</label>
                <p className="text-[11px] text-[#A1A1AA] italic mb-6">Choose which team members are responsible for this client relationship.</p>
                <div className="bg-white border border-[#E5E5E5] p-6 shadow-sm">
                  <AssignmentManager
                    entityId={client.id}
                    entityType="client"
                    initialMembers={client.assignedEmployees || []}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">4. Timelines & Identity</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">How long is your relationship, and what does it look like?</p>
            </div>

            <ComboboxInput
              label="Overall Engagement Timeline"
              value={formData.timeline}
              onChange={(val) => setFormData({ ...formData, timeline: val })}
              options={TIMELINE_OPTIONS}
              placeholder="e.g. Q1 2024 – Q4 2025"
              helperText="How long the overall client engagement spans. This is the total duration, not project-specific."
              tooltip="Useful for capacity planning and understanding long-term vs. short-term clients."
            />

            <div className="space-y-8">
              <div className="flex justify-between items-center border-b-2 border-[#0A0A0A] pb-4">
                <div>
                  <label className="block text-[12px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Relationship Milestones</label>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1">Key dates in your relationship history — contract signed, first delivery, renewal, etc.</p>
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
                  <p className="text-[12px] text-[#71717A] uppercase tracking-widest">No milestones yet.</p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-2">e.g. "Contract Signed", "First Delivery", "Renewal"</p>
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
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <PremiumInput
                            label="Title"
                            placeholder="e.g. Contract Signed"
                            value={m.title}
                            onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <PremiumInput
                            label="Date"
                            type="date"
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
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-[#0A0A0A]">
              <div>
                <label className="block text-[12px] font-black uppercase tracking-[0.15em] text-[#0A0A0A] mb-1">Client Photo / Logo</label>
                <p className="text-[11px] text-[#A1A1AA] italic mb-4">Upload the client's logo or a representative photo. Shown on their profile and in lists.</p>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-8">
                <ImageUploader
                  images={formData.photoUrl ? [formData.photoUrl] : []}
                  onChange={(imgs) => setFormData({ ...formData, photoUrl: imgs.length > 0 ? imgs[0] : "" })}
                  maxImages={1}
                />
              </div>
            </div>
          </motion.div>
        );

      case 4: {
        const requiredFilled = formData.name.trim();
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">Review & Confirm</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Verify everything looks right before saving.</p>
            </div>

            <div className="border border-[#E5E5E5] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5]">
                <SField label="Client Name" value={formData.name} />
                <SField label="Timeline" value={formData.timeline} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Email" value={formData.email} />
                <SField label="Phone" value={formData.phone} />
              </div>
              <div className="border-t border-[#E5E5E5]">
                <SField label="Location" value={formData.location} />
              </div>
              {formData.description && (
                <div className="border-t border-[#E5E5E5] p-4 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Description</p>
                  <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-3">{formData.description}</p>
                </div>
              )}
              {formData.notes && (
                <div className="border-t border-[#E5E5E5] p-4 bg-[#FFFBEB]">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Internal Notes (team-only)</p>
                  <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-2">{formData.notes}</p>
                </div>
              )}
              <div className="border-t border-[#E5E5E5] p-4 bg-white">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Milestones</p>
                <p className="text-[13px] text-[#0A0A0A] font-medium">{formData.milestones.length > 0 ? `${formData.milestones.length} defined` : "None"}</p>
              </div>
            </div>

            <div className={`p-4 border-l-4 ${requiredFilled ? "border-l-[#16A34A] bg-[#F0FDF4]" : "border-l-[#DC2626] bg-[#FEF2F2]"}`}>
              {requiredFilled ? (
                <p className="text-[12px] text-[#166534] font-medium">
                  ✓ All required fields filled. Click <strong>Complete Setup</strong> to save this client.
                </p>
              ) : (
                <p className="text-[12px] text-[#991B1B] font-medium">
                  ✗ <strong>Client Name</strong> is required. Go back to fill it in.
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
            You do not have permission to view or edit this client.
          </p>
          <button
            onClick={() => router.push("/dashboard/clients")}
            className="w-full h-12 bg-[#0A0A0A] text-[#FAFAFA] font-medium text-[13px] uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors"
          >
            Return to Clients
          </button>
        </motion.div>
      </div>
    );
  }

  const totalIncome = client.incomes?.reduce((acc: number, inc: { amount: number }) => acc + inc.amount, 0) || 0;
  const totalExpense = client.expenses?.reduce((acc: number, exp: { amount: number }) => acc + exp.amount, 0) || 0;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#E5E5E5] pb-8">
        <div className="flex gap-6 items-end">
          {client.photoUrl && (
            <div className="w-24 h-24 relative overflow-hidden">
              <Image src={client.photoUrl} alt={client.name} fill className="object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-[40px] font-black tracking-tight leading-[1.1] text-[#0A0A0A] uppercase">
              {client.name}
            </h1>
            <p className="text-[14px] text-[#71717A] mt-2 font-mono">ID: {client.id} {client.email ? ` | ${client.email}` : ''} {client.phone ? ` | ${client.phone}` : ''}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-6 py-3 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors duration-200"
          >
            Edit Client
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-6 py-3 bg-transparent text-[#DC2626] text-[13px] font-medium tracking-[0.04em] uppercase border border-[#DC2626] hover:bg-[#DC2626] hover:text-[#FAFAFA] transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Description</h2>
            <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light">
              {client.description || "No description provided."}
            </p>
          </section>

          {client.notes && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Internal Notes</h2>
              <div className="p-6 bg-[#FAFAFA] border-l-4 border-yellow-400">
                <p className="text-[14px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-mono">
                  {client.notes}
                </p>
              </div>
            </section>
          )}

          {client.location && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Location</h2>
              <p className="text-[14px] text-[#0A0A0A] mb-4">{client.location}</p>
              <div className="w-full h-64 border border-[#E5E5E5] overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(client.location)}&output=embed`}
                ></iframe>
              </div>
            </section>
          )}

          {client.milestones && client.milestones.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Milestones</h2>
              <div className="space-y-6 border-l border-[#E5E5E5] pl-6">
                {client.milestones.map((m: Milestone, i: number) => (
                  <div key={i} className="relative group">
                    <div className="absolute left-[-29px] top-1.5 w-2 h-2 rounded-none border border-[#0A0A0A] transition-colors bg-[#0A0A0A]" />
                    <h3 className="text-[14px] font-semibold text-[#0A0A0A]">{m.title}</h3>
                    {m.date && <p className="text-[12px] text-[#71717A] mt-1 mb-2">{m.date}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {client.projects && client.projects.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Linked Projects</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.projects.map((p: { id: string; projectName: string; projectStatus: string }) => (
                  <Link href={`/dashboard/projects/${p.id}`} key={p.id} className="block p-4 border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors">
                    <h3 className="text-[14px] font-bold uppercase">{p.projectName}</h3>
                    <p className="text-[12px] text-[#71717A]">{p.projectStatus}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-6 border border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Financial Overview</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Total Revenue</dt>
                <dd className="text-[16px] font-bold text-[#16A34A]">+{totalIncome} PLN</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Total Expenses</dt>
                <dd className="text-[16px] font-bold text-[#DC2626]">-{totalExpense} PLN</dd>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E5E5E5]">
                <button
                  onClick={() => setIsFinanceOpen(true)}
                  className="block text-center w-full py-2 bg-transparent border border-[#0A0A0A] text-[#0A0A0A] text-[11px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-[#FAFAFA] transition-colors"
                >
                  Manage Finances
                </button>
              </div>
            </dl>
          </div>

          <div className="p-6 border border-[#E5E5E5]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {[...(client.incomes || []), ...(client.expenses || [])]
                .sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((t: { amount: number; date: string; description: string; source?: string }, i: number) => {
                  const isIncome = 'source' in t;
                  return (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#F4F4F5] last:border-0">
                      <div>
                        <p className="text-[12px] font-bold text-[#0A0A0A]">{t.description || (isIncome ? "Income" : "Expense")}</p>
                        <p className="text-[10px] text-[#71717A] uppercase tracking-wider">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <p className={`text-[12px] font-bold ${isIncome ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                        {isIncome ? "+" : "-"}{t.amount}
                      </p>
                    </div>
                  );
                })
              }
              {(!client.incomes?.length && !client.expenses?.length) && (
                <p className="text-[11px] text-[#71717A] italic">No transactions yet.</p>
              )}
            </div>
          </div>

          <div className="p-6 border border-[#E5E5E5]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Assigned Team</h2>
            <AssignmentManager
              entityId={client.id}
              entityType="client"
              initialMembers={client.assignedEmployees || []}
            />
          </div>

          <div className="p-6 border border-[#E5E5E5]">
            <RelatedDocuments spaceId={spaceId} clientId={client.id} />
          </div>
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
            <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-2">Delete Client</h2>
            <p className="text-[14px] text-[#71717A] mb-6">
              This action cannot be undone. To verify, type <span className="font-bold text-[#0A0A0A]">{client.name}</span> below.
            </p>
            <PremiumInput
              label="Client Name Verification"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type client name..."
              className="mb-6"
              error={deleteConfirmation.trim() && deleteConfirmation.trim() !== client.name.trim() ? "Name mismatch" : ""}
            />
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation.trim() !== client.name.trim() || isSubmitting}
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

      {/* Setup Stepper */}
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
                  <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Client Setup</h2>
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
              <form id="client-setup-form" onSubmit={handleSetupSubmit}>
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
                  type="button"
                  onClick={() => handleEditSubmit()}
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
              <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Edit Client</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A]">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-12">
              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Basic Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput label="Client Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} helperText="Full name of the company or individual." />
                  <PremiumInput label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <PremiumInput label="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  <ComboboxInput label="Location" value={formData.location} onChange={(val) => setFormData({ ...formData, location: val })} options={LOCATION_OPTIONS} placeholder="e.g. Warsaw, Poland" helperText="Client's primary business location." />
                  <ComboboxInput label="Engagement Timeline" value={formData.timeline} onChange={(val) => setFormData({ ...formData, timeline: val })} options={TIMELINE_OPTIONS} placeholder="e.g. Q1 2024 – Q4 2025" helperText="Overall relationship duration." />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Narrative</h3>
                </div>
                <div className="space-y-6">
                  <PremiumTextarea label="Description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} helperText="Public-facing overview of who this client is." />
                  <PremiumTextarea label="Internal Notes" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} helperText="Team-only notes — preferences, quirks, decision-makers." />
                </div>
              </section>

              <div className="pt-8 border-t border-[#E5E5E5] flex justify-end gap-4 sticky bottom-0 bg-white p-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 border border-[#E5E5E5] text-[#0A0A0A] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F4F4F5]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-[#0A0A0A] text-[#FAFAFA] font-bold text-[11px] uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A]">{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Finance Modal */}
      {isFinanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white border border-[#E5E5E5] p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5] pb-4">
              <h2 className="text-[20px] font-bold text-[#0A0A0A] uppercase tracking-tight">Add Financial Record</h2>
              <button onClick={() => setIsFinanceOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A]">✕</button>
            </div>

            <form onSubmit={handleFinanceSubmit} className="space-y-6">
              <div className="grid grid-cols-2 border border-[#E5E5E5]">
                <button type="button" onClick={() => setFinanceType("INCOME")} className={`py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${financeType === "INCOME" ? "bg-[#0A0A0A] text-white" : "bg-white text-[#71717A] hover:bg-[#F4F4F5]"}`}>Income</button>
                <button type="button" onClick={() => setFinanceType("EXPENSE")} className={`py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${financeType === "EXPENSE" ? "bg-[#0A0A0A] text-white" : "bg-white text-[#71717A] hover:bg-[#F4F4F5]"}`}>Expense</button>
              </div>
              <PremiumInput label="Amount (PLN)" type="number" required value={financeData.amount} onChange={(e) => setFinanceData({ ...financeData, amount: e.target.value })} placeholder="0.00" />
              <PremiumInput label="Date" type="date" required value={financeData.date} onChange={(e) => setFinanceData({ ...financeData, date: e.target.value })} />
              {financeType === "INCOME" ? (
                <PremiumInput label="Source" value={financeData.source} onChange={(e) => setFinanceData({ ...financeData, source: e.target.value })} placeholder="e.g. Project Payment" />
              ) : (
                <PremiumInput label="Category" value={financeData.category} onChange={(e) => setFinanceData({ ...financeData, category: e.target.value })} placeholder="e.g. Marketing, SaaS, Salary..." />
              )}
              <PremiumTextarea label="Description" rows={3} value={financeData.description} onChange={(e) => setFinanceData({ ...financeData, description: e.target.value })} placeholder="Optional details..." />
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-[#0A0A0A] text-white font-bold text-[11px] uppercase tracking-widest hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">{isSubmitting ? "Saving..." : "Add Record"}</button>
                <button type="button" onClick={() => setIsFinanceOpen(false)} className="flex-1 h-12 bg-transparent border border-[#E5E5E5] text-[#0A0A0A] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F4F4F5] transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
