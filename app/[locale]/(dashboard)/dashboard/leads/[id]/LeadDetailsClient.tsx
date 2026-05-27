"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { deleteLead } from "@/actions/deleteLead";
import { updateLead } from "@/actions/updateLead";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useTranslation } from "@/app/context/TranslationContext";
import { PremiumInput, PremiumTextarea, PremiumSelect } from "@/app/components/UI/FormElements";
import { ComboboxInput } from "@/app/components/UI/ComboboxInput";
import { PROJECT_TYPE_OPTIONS, LEAD_STAGE_OPTIONS } from "@/lib/predefined-data";

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

const SField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="p-4 bg-white">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">{label}</p>
      <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-2">{value}</p>
    </div>
  );
};

export default function LeadDetailsClient({ lead, isUnauthorized = false }: { lead: Lead, isUnauthorized?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCustomLabel } = useBreadcrumb();
  const { t } = useTranslation();
  const pathname = usePathname();

  const STEPS = [
    t("dashboard:leads.step_contact_info", "Contact Info"),
    t("dashboard:leads.step_business_details", "Business Details"),
    t("dashboard:leads.step_additional_notes", "Additional Notes"),
    t("dashboard:leads.step_review", "Review & Confirm"),
  ];

  useEffect(() => {
    setCustomLabel(lead.leadName);
    return () => setCustomLabel(null);
  }, [lead.leadName, setCustomLabel]);

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
      toast.success(t("dashboard:leads.lead_deleted", "Lead deleted successfully"));
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
      toast.success(t("dashboard:leads.lead_updated", "Lead updated successfully"));
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
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.contact_information", "1. Contact Information")}</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">{t("dashboard:leads.who_talking_to", "The person you're in conversation with at this company.")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumInput
                label={t("dashboard:leads.contact_name", "Contact Name")}
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder={t("dashboard:leads.contact_name_placeholder", "e.g. John Doe")}
                helperText="The primary person at the client's side — whoever you've spoken to."
              />
              <PremiumInput
                label={t("dashboard:leads.role_label", "Role / Position")}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder={t("dashboard:leads.role_placeholder", "e.g. CEO, Marketing Director")}
                helperText="Their job title. Helps tailor proposals and know who the decision-maker is."
              />
              <PremiumInput
                label={t("dashboard:leads.email", "Email")}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("dashboard:leads.email_placeholder", "john@example.com")}
                helperText="Primary email for follow-ups and proposals."
              />
              <PremiumInput
                label={t("dashboard:leads.phone", "Phone")}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("dashboard:leads.phone_placeholder", "+1 234 567 890")}
                helperText="Useful for quick calls. Include country code for international leads."
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.business_details", "2. Business Details")}</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">{t("dashboard:leads.what_is_opportunity", "The opportunity — what are they asking for and where does it stand?")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ComboboxInput
                label={t("dashboard:leads.project_type", "Project Type")}
                value={formData.projectType}
                onChange={(val) => setFormData({ ...formData, projectType: val })}
                options={PROJECT_TYPE_OPTIONS}
                placeholder={t("dashboard:leads.project_type_placeholder", "e.g. Web Development")}
                helperText="The kind of work this lead is enquiring about. Used to match templates and estimate workload."
                tooltip="Choose from common project categories or type your own. This helps filter leads by service type."
              />
              <PremiumSelect
                label={t("dashboard:leads.status", "Status")}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "COLD" | "NEGOTIATION" | "QUALIFIED" })}
                options={[
                  { value: "COLD", label: t("dashboard:leads.status_cold", "Cold — initial contact, no engagement yet") },
                  { value: "NEGOTIATION", label: t("dashboard:leads.status_negotiation", "Negotiation — active conversation underway") },
                  { value: "QUALIFIED", label: t("dashboard:leads.status_qualified", "Qualified — likely to convert") }
                ]}
                helperText="How far along this lead is in your pipeline."
              />
              <ComboboxInput
                label={t("dashboard:leads.current_stage_label", "Current Stage")}
                value={formData.stage}
                onChange={(val) => setFormData({ ...formData, stage: val })}
                options={LEAD_STAGE_OPTIONS}
                placeholder={t("dashboard:leads.stage_placeholder", "e.g. Proposal Sent")}
                helperText="The specific step in your sales process this lead is at right now."
                tooltip="More granular than Status — tracks exactly what has happened and what the next step is."
              />
              <div className="flex items-start gap-4 pt-4">
                <input
                  type="checkbox"
                  id="turnedIntoClient"
                  checked={formData.turnedIntoClient}
                  onChange={(e) => setFormData({ ...formData, turnedIntoClient: e.target.checked })}
                  className="w-6 h-6 accent-[#0A0A0A] border-2 border-[#D4D4D8] rounded-none cursor-pointer mt-0.5"
                />
                <div>
                  <label htmlFor="turnedIntoClient" className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] cursor-pointer block">{t("dashboard:leads.turned_into_client", "Turned into client")}</label>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1">Mark this once the lead has signed and becomes a client in the system.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.lead_description", "3. Lead Description")}</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">{t("dashboard:leads.capture_narrative", "Capture everything else — the context, the story, the nuance.")}</p>
            </div>
            <PremiumTextarea
              label={t("dashboard:leads.main_description", "Notes & Background")}
              rows={8}
              value={formData.leadInfo}
              onChange={(e) => setFormData({ ...formData, leadInfo: e.target.value })}
              placeholder={t("dashboard:leads.additional_placeholder", "How did they find us? What's the timeline? Budget hinted? Key requirements mentioned? Blockers? Anything the team should know before the next call...")}
              helperText="A free-form notes field. Great for capturing call notes, key requirements, or anything that doesn't fit a structured field."
            />
          </motion.div>
        );

      case 3: {
        const requiredFilled = formData.leadName.trim();
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="border-l-4 border-[#0A0A0A] pl-6 py-2">
              <h3 className="text-[24px] font-black text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.step_review", "Review & Confirm")}</h3>
              <p className="text-[13px] text-[#71717A] uppercase tracking-wider font-medium">Verify everything looks right before saving.</p>
            </div>

            <div className="border border-[#E5E5E5] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5]">
                <SField label="Lead Name" value={formData.leadName} />
                <SField label="Status" value={formData.status} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Project Type" value={formData.projectType} />
                <SField label="Current Stage" value={formData.stage} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Contact Person" value={formData.contactName} />
                <SField label="Role / Position" value={formData.role} />
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5] border-t border-[#E5E5E5]">
                <SField label="Email" value={formData.email} />
                <SField label="Phone" value={formData.phone} />
              </div>
              {formData.leadInfo && (
                <div className="border-t border-[#E5E5E5] p-4 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A1A1AA] mb-1">Notes & Background</p>
                  <p className="text-[13px] text-[#0A0A0A] font-medium leading-snug line-clamp-3">{formData.leadInfo}</p>
                </div>
              )}
              {formData.turnedIntoClient && (
                <div className="border-t border-[#E5E5E5] p-4 bg-[#F0FDF4]">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#16A34A] mb-1">Conversion</p>
                  <p className="text-[13px] text-[#166534] font-medium">Marked as converted to client ✓</p>
                </div>
              )}
            </div>

            <div className={`p-4 border-l-4 ${requiredFilled ? "border-l-[#16A34A] bg-[#F0FDF4]" : "border-l-[#DC2626] bg-[#FEF2F2]"}`}>
              {requiredFilled ? (
                <p className="text-[12px] text-[#166534] font-medium">
                  ✓ All required fields filled. Click <strong>Complete Setup</strong> to save this lead.
                </p>
              ) : (
                <p className="text-[12px] text-[#991B1B] font-medium">
                  ✗ <strong>Lead Name</strong> is required. Go back to fill it in.
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl text-center">
          <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-4">{t("dashboard:leads.unauthorized_title", "Unauthorized Access")}</h2>
          <p className="text-[14px] text-[#71717A] mb-8">{t("dashboard:leads.unauthorized_desc", "You do not have permission to view or edit this lead.")}</p>
          <button onClick={() => router.push("/dashboard/leads")} className="w-full h-12 bg-[#0A0A0A] text-[#FAFAFA] font-medium text-[13px] uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors">{t("dashboard:leads.return_to_leads", "Return to Leads")}</button>
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
            <span className={`inline-block px-2 py-1 text-[10px] font-bold tracking-[0.08em] uppercase border ${formData.status === 'QUALIFIED' ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' :
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
                {t("dashboard:leads.client", "CLIENT")}
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
            {t("dashboard:leads.edit_lead", "Edit Lead")}
          </button>
          <button onClick={() => setIsDeleteOpen(true)} className="px-6 py-3 bg-transparent text-[#DC2626] text-[13px] font-medium tracking-[0.04em] uppercase border border-[#DC2626] hover:bg-[#DC2626] hover:text-[#FAFAFA] transition-colors duration-200">
            {t("dashboard:leads.delete", "Delete")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">{t("dashboard:leads.about_lead", "About Lead")}</h2>
            <p className="text-[16px] text-[#0A0A0A] leading-[1.65] whitespace-pre-wrap font-light">
              {lead.leadInfo || t("dashboard:leads.no_info", "No additional information provided.")}
            </p>
          </section>

          {lead.stage && (
            <section>
              <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A] mb-4">{t("dashboard:leads.current_stage", "Current Stage")}</h2>
              <div className="p-4 bg-[#F4F4F5] border border-[#E5E5E5] w-max">
                <p className="text-[14px] font-bold uppercase tracking-wider text-[#0A0A0A]">{lead.stage}</p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-6 border border-[#E5E5E5] bg-[#FAFAFA]">
            <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#0A0A0A] mb-6">{t("dashboard:leads.contact_details", "Contact Details")}</h2>
            <dl className="space-y-4">
              {lead.contactName && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">{t("dashboard:leads.contact_person", "Contact Person")}</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.contactName}</dd>
                </div>
              )}
              {lead.role && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">{t("dashboard:leads.role_position", "Role / Position")}</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.role}</dd>
                </div>
              )}
              {lead.email && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">{t("dashboard:leads.email", "Email")}</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </dd>
                </div>
              )}
              {lead.phone && (
                <div>
                  <dt className="text-[10px] tracking-[0.06em] uppercase text-[#71717A] mb-1">{t("dashboard:leads.phone", "Phone")}</dt>
                  <dd className="text-[14px] font-medium text-[#0A0A0A]">{lead.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Setup Stepper */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-[#E5E5E5] shadow-2xl">
            <div className="p-8 border-b border-[#E5E5E5]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.lead_configuration", "Lead Configuration")}</h2>
                  <p className="text-[12px] text-[#71717A] uppercase tracking-[0.08em] mt-1">{t("dashboard:leads.step_of", "Step {{current}} of {{total}}: {{name}}", { current: currentStep + 1, total: STEPS.length, name: STEPS[currentStep] })}</p>
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
            <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAFAFA]">
              <form id="lead-setup-form" onSubmit={handleSetupSubmit}>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </form>
            </div>
            <div className="p-6 border-t border-[#E5E5E5] bg-white flex justify-between items-center">
              <button type="button" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]">{t("dashboard:leads.back", "Back")}</button>
              {currentStep < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors">{t("dashboard:leads.continue", "Continue")}</button>
              ) : (
                <button type="submit" form="lead-setup-form" disabled={isSubmitting} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">{isSubmitting ? t("dashboard:leads.saving", "Saving...") : t("dashboard:leads.complete_setup", "Complete Setup")}</button>
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
              <h2 className="text-[24px] font-bold text-[#0A0A0A] uppercase tracking-tight">{t("dashboard:leads.edit_lead", "Edit Lead")}</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-[#71717A] hover:text-[#0A0A0A]">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-12">
              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">{t("dashboard:leads.basic_information", "Basic Information")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput
                    label={t("dashboard:leads.lead_name", "Lead Name")}
                    required
                    value={formData.leadName}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    helperText="Usually the company name or opportunity name."
                  />
                  <PremiumSelect
                    label={t("dashboard:leads.status", "Status")}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "COLD" | "NEGOTIATION" | "QUALIFIED" })}
                    options={[
                      { value: "COLD", label: t("dashboard:leads.status_cold", "Cold") },
                      { value: "NEGOTIATION", label: t("dashboard:leads.status_negotiation", "Negotiation") },
                      { value: "QUALIFIED", label: t("dashboard:leads.status_qualified", "Qualified") }
                    ]}
                    helperText="Pipeline position of this lead."
                  />
                  <ComboboxInput
                    label={t("dashboard:leads.project_type", "Project Type")}
                    value={formData.projectType}
                    onChange={(val) => setFormData({ ...formData, projectType: val })}
                    options={PROJECT_TYPE_OPTIONS}
                    placeholder={t("dashboard:leads.project_type_placeholder", "e.g. Web Development")}
                    helperText="Type of work they're enquiring about."
                    tooltip="Choose from common categories or type your own."
                  />
                  <ComboboxInput
                    label={t("dashboard:leads.current_stage_label", "Current Stage")}
                    value={formData.stage}
                    onChange={(val) => setFormData({ ...formData, stage: val })}
                    options={LEAD_STAGE_OPTIONS}
                    placeholder={t("dashboard:leads.stage_placeholder", "e.g. Proposal Sent")}
                    helperText="Exact step in your sales process."
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">{t("dashboard:leads.contact_details", "Contact Details")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PremiumInput label={t("dashboard:leads.contact_name", "Contact Name")} value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} helperText="Primary person at the client side." />
                  <PremiumInput label={t("dashboard:leads.role_label", "Role / Position")} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} helperText="Their job title — helps tailor proposals." />
                  <PremiumInput label={t("dashboard:leads.email", "Email")} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <PremiumInput label={t("dashboard:leads.phone", "Phone")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </section>

              <section className="space-y-8">
                <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#0A0A0A]">{t("dashboard:leads.additional_info", "Additional Info")}</h3>
                </div>
                <div className="space-y-8">
                  <PremiumTextarea label={t("dashboard:leads.lead_notes", "Notes & Background")} rows={6} value={formData.leadInfo} onChange={(e) => setFormData({ ...formData, leadInfo: e.target.value })} helperText="Free-form notes — call summaries, requirements, budget hints, blockers, anything relevant." />
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="editTurnedIntoClient"
                      checked={formData.turnedIntoClient}
                      onChange={(e) => setFormData({ ...formData, turnedIntoClient: e.target.checked })}
                      className="w-6 h-6 accent-[#0A0A0A] border-2 border-[#D4D4D8] rounded-none cursor-pointer mt-0.5"
                    />
                    <div>
                      <label htmlFor="editTurnedIntoClient" className="text-[12px] font-black uppercase tracking-widest text-[#0A0A0A] cursor-pointer block">{t("dashboard:leads.turned_into_client", "Turned into client")}</label>
                      <p className="text-[11px] text-[#A1A1AA] italic mt-1">Mark once the lead has signed and converted.</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-[#E5E5E5] flex justify-end gap-4 sticky bottom-0 bg-white pb-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 h-12 bg-transparent text-[#0A0A0A] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-[#F4F4F5] transition-colors border border-[#E5E5E5]">{t("dashboard:leads.cancel", "Cancel")}</button>
                <button type="submit" disabled={isSubmitting} className="px-8 h-12 bg-[#0A0A0A] text-[#FAFAFA] text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-transparent hover:text-[#0A0A0A] border border-[#0A0A0A] transition-colors disabled:opacity-50">{isSubmitting ? t("dashboard:leads.saving", "Saving...") : t("dashboard:leads.save_changes", "Save Changes")}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-2xl">
            <h2 className="text-[20px] font-bold text-[#DC2626] uppercase tracking-tight mb-2">{t("dashboard:leads.delete_lead", "Delete Lead")}</h2>
            <p className="text-[14px] text-[#71717A] mb-6">{t("dashboard:leads.delete_warning", "This action cannot be undone. To verify, type")} <span className="font-bold text-[#0A0A0A]">{lead.leadName}</span> {t("dashboard:leads.below", "below.")}</p>
            <PremiumInput
              label={t("dashboard:leads.lead_name_verification", "Lead Name Verification")}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={t("dashboard:leads.type_lead_name", "Type lead name...")}
              className="mb-6"
              error={deleteConfirmation && deleteConfirmation !== lead.leadName ? t("dashboard:leads.name_mismatch", "Name mismatch") : ""}
            />
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== lead.leadName || isSubmitting}
                className="flex-1 h-12 bg-[#DC2626] text-white font-bold text-[11px] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                {isSubmitting ? t("dashboard:leads.deleting", "Deleting...") : t("dashboard:leads.delete_permanently", "Delete Permanently")}
              </button>
              <button
                onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(""); }}
                className="flex-1 h-12 bg-transparent border border-[#E5E5E5] text-[#0A0A0A] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F4F4F5] transition-colors"
              >
                {t("dashboard:leads.cancel", "Cancel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
