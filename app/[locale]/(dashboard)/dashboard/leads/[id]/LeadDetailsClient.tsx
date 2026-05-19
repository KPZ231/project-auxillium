"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deleteLead } from "@/actions/deleteLead";
import { updateLead } from "@/actions/updateLead";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { PremiumInput, PremiumTextarea, PremiumSelect } from "@/app/components/UI/FormElements";

const STEPS = [
  "Contact Info",
  "Business Details",
  "Additional Notes"
];

interface Lead {
  id: string;
  leadName: string;
  leadInfo?: string;
  status: string;
  projectType?: string;
  contactName?: string;
  role?: string;
  email?: string;
  phone?: string;
  stage?: string;
  turnedIntoClient: boolean;
}

export default function LeadDetailsClient({ lead, isUnauthorized = false }: { lead: Lead, isUnauthorized?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCustomLabel } = useBreadcrumb();

  useEffect(() => {
    setCustomLabel(lead.leadName);
    return () => setCustomLabel(null);
  }, [lead.leadName, setCustomLabel]);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(searchParams.get("setup") === "true");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (searchParams.get("setup") === "true") {
      window.history.replaceState(null, '', `/dashboard/leads/${lead.id}`);
    }
  }, [searchParams, lead.id]);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  const [formData, setFormData] = useState({
    id: lead.id,
    leadName: lead.leadName,
    leadInfo: lead.leadInfo || "",
    status: lead.status,
    projectType: lead.projectType || "",
    contactName: lead.contactName || "",
    role: lead.role || "",
    email: lead.email || "",
    phone: lead.phone || "",
    stage: lead.stage || "",
    turnedIntoClient: lead.turnedIntoClient || false,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteLead(lead.id, deleteConfirmation);
    
    if (result.success) {
      toast.success("Lead deleted successfully");
      router.push("/dashboard/leads");
    } else {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateLead(formData as any);

    if (result.success) {
      toast.success("Lead updated successfully");
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">1. Contact Information</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Who are we talking to?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumInput 
                label="Contact Name" 
                value={formData.contactName} 
                onChange={(e) => setFormData({...formData, contactName: e.target.value})} 
                placeholder="e.g. John Doe" 
              />
              <PremiumInput 
                label="Role / Position" 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                placeholder="e.g. CEO" 
              />
              <PremiumInput 
                label="Email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="john@example.com" 
              />
              <PremiumInput 
                label="Phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                placeholder="+1 234 567 890" 
              />
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">2. Business Details</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">What is the opportunity?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumInput 
                label="Project Type" 
                value={formData.projectType} 
                onChange={(e) => setFormData({...formData, projectType: e.target.value})} 
                placeholder="e.g. Web Development" 
              />
              <PremiumSelect 
                label="Status" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value as "COLD" | "NEGOTIATION" | "QUALIFIED"})}
                options={[
                  { value: "COLD", label: "Cold" },
                  { value: "NEGOTIATION", label: "Negotiation" },
                  { value: "QUALIFIED", label: "Qualified" }
                ]}
              />
              <PremiumInput 
                label="Current Stage" 
                value={formData.stage} 
                onChange={(e) => setFormData({...formData, stage: e.target.value})} 
                placeholder="e.g. Discovery" 
              />
              <div className="flex items-center gap-4 pt-4">
                <input 
                  type="checkbox" 
                  id="turnedIntoClient" 
                  checked={formData.turnedIntoClient} 
                  onChange={(e) => setFormData({...formData, turnedIntoClient: e.target.checked})} 
                  className="w-6 h-6 accent-[#0A0A0A] border-2 border-[#D4D4D8] rounded-none cursor-pointer" 
                />
                <label htmlFor="turnedIntoClient" className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] cursor-pointer">Turned into client</label>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">3. Lead Description</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Capture the narrative.</p>
            </div>
            <PremiumTextarea 
              label="Main Description" 
              rows={8} 
              value={formData.leadInfo} 
              onChange={(e) => setFormData({...formData, leadInfo: e.target.value})} 
              placeholder="Additional background information or notes..." 
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isUnauthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl text-center">
          <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-4">Unauthorized Access</h2>
          <p className="text-[14px] text-[#71717A] mb-8">You do not have permission to view or edit this lead.</p>
          <button onClick={() => router.push("/dashboard/leads")} className="w-full h-12 bg-[#0A0A0A] text-[#FAFAFA] font-medium text-[13px] uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors">Return to Leads</button>
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
            <span className={`inline-block px-2 py-1 text-[10px] font-bold tracking-[0.08em] uppercase border ${
                formData.status === 'QUALIFIED' ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' :
                formData.status === 'NEGOTIATION' ? 'bg-orange-500 text-white border-orange-500' :
                'bg-[#F4F4F5] text-[#0A0A0A] border-[#D4D4D8]'
              }`}>
              {formData.status}
            </span>
            {formData.projectType && (
              <span className="inline-block px-2 py-1 bg-transparent border border-[#E5E5E5] text-[#71717A] text-[10px] font-bold tracking-[0.08em] uppercase">
                {formData.projectType}
              </span>
            )}
            {formData.turnedIntoClient && (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold tracking-[0.08em] uppercase">
                CLIENT
              </span>
            )}
          </div>
          <h1 className="text-[40px] font-black tracking-tight leading-[1.1] text-[#0A0A0A] uppercase">
            {lead.leadName}
          </h1>
          <p className="text-[14px] text-[#71717A] mt-2 font-mono">ID: {lead.id}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsEditOpen(true)} className="px-6 py-3 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors duration-200">
            Edit Lead
          </button>
          <button onClick={() => setIsDeleteOpen(true)} className="px-6 py-3 bg-transparent text-[#DC2626] text-[13px] font-medium tracking-[0.04em] uppercase border border-[#DC2626] hover:bg-[#DC2626] hover:text-[#FAFAFA] transition-colors duration-200">
            Delete
          </button>
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">About Lead</h2>
            <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light">
              {lead.leadInfo || "No additional information provided."}
            </p>
          </section>

          {lead.stage && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">Current Stage</h2>
              <div className="p-4 bg-[#F4F4F5] border border-[#E5E5E5] w-max">
                <p className="text-[14px] font-bold uppercase tracking-wider text-[#0A0A0A]">{lead.stage}</p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-6 border border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">Contact Details</h2>
            <dl className="space-y-4">
              {lead.contactName && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Contact Person</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.contactName}</dd>
                </div>
              )}
              {lead.role && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Role / Position</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.role}</dd>
                </div>
              )}
              {lead.email && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Email</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </dd>
                </div>
              )}
              {lead.phone && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">Phone</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Setup Stepper Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-[#E5E5E5] shadow-2xl">
            <div className="p-8 border-b border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Lead Configuration</h2>
                  <p className="text-[12px] text-[#71717A] uppercase tracking-[0.08em] mt-1">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
                </div>
                <button onClick={() => setIsSetupOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A] text-xl">✕</button>
              </div>
              <div className="flex gap-2">
                {STEPS.map((_, idx) => (
                  <div key={idx} className="flex-1 h-1 bg-[#F4F4F5]">
                    <motion.div className="h-full bg-[#0A0A0A]" initial={{ width: "0%" }} animate={{ width: idx <= currentStep ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
              <form id="lead-setup-form" onSubmit={handleSetupSubmit}>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </form>
            </div>
            <div className="p-6 border-t border-[#E5E5E5] bg-white flex justify-between items-center">
              <button type="button" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]">Back</button>
              {currentStep < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors">Continue</button>
              ) : (
                <button type="submit" form="lead-setup-form" disabled={isSubmitting} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">{isSubmitting ? "Saving..." : "Complete Setup"}</button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E5E5] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5] pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">Edit Lead</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A]">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-12">
              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput 
                    label="Lead Name" 
                    required 
                    value={formData.leadName} 
                    onChange={(e) => setFormData({...formData, leadName: e.target.value})} 
                  />
                  <PremiumSelect 
                    label="Status" 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as "COLD" | "NEGOTIATION" | "QUALIFIED"})}
                    options={[
                      { value: "COLD", label: "Cold" },
                      { value: "NEGOTIATION", label: "Negotiation" },
                      { value: "QUALIFIED", label: "Qualified" }
                    ]}
                  />
                  <PremiumInput 
                    label="Project Type" 
                    value={formData.projectType} 
                    onChange={(e) => setFormData({...formData, projectType: e.target.value})} 
                  />
                  <PremiumInput 
                    label="Current Stage" 
                    value={formData.stage} 
                    onChange={(e) => setFormData({...formData, stage: e.target.value})} 
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Contact Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput label="Contact Name" value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} />
                  <PremiumInput label="Role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                  <PremiumInput label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <PremiumInput label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">Additional Info</h3>
                </div>
                <div className="space-y-8">
                  <PremiumTextarea label="Lead Notes" rows={6} value={formData.leadInfo} onChange={(e) => setFormData({...formData, leadInfo: e.target.value})} />
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="editTurnedIntoClient" 
                      checked={formData.turnedIntoClient} 
                      onChange={(e) => setFormData({...formData, turnedIntoClient: e.target.checked})} 
                      className="w-6 h-6 accent-[#0A0A0A] border-2 border-[#D4D4D8] rounded-none cursor-pointer" 
                    />
                    <label htmlFor="editTurnedIntoClient" className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] cursor-pointer">Turned into client</label>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-[#E5E5E5] flex justify-end gap-4 sticky bottom-0 bg-white pb-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl">
            <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-2">Delete Lead</h2>
            <p className="text-[14px] text-[#71717A] mb-6">This action cannot be undone. To verify, type <span className="font-bold text-[#0A0A0A]">{lead.leadName}</span> below.</p>
            <PremiumInput 
              label="Lead Name Verification"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type lead name..."
              className="mb-6"
              error={deleteConfirmation && deleteConfirmation !== lead.leadName ? "Name mismatch" : ""}
            />
            <div className="flex gap-4">
              <button 
                onClick={handleDelete} 
                disabled={deleteConfirmation !== lead.leadName || isSubmitting} 
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
    </>
  );
}
