"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Upload, Download, Trash2, LogOut, Mail, ShieldCheck, Save, Image as ImageIcon, Link, CheckCircle2, CreditCard, Calendar, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { SiGooglesheets, SiGoogledrive, SiGoogledocs, SiGooglecalendar, SiGoogletasks } from "react-icons/si";
import { uploadAvatar } from "@/actions/uploadAvatar";
import { ConnectorModal } from "@/app/components/settings/ConnectorModal";
import { ConnectorType, getConnectedServices } from "@/actions/connectors";
import { updateProfile } from "@/actions/updateProfile";
import { exportUserData } from "@/actions/exportUserData";
import { deleteAccountAction } from "@/actions/updateProfile";
import { logoutAction } from "@/actions/logout";
import { useUser, useUserPlan } from "@/app/context/UserContext";
import { useTranslation } from "@/app/context/TranslationContext";

interface UserData {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export default function SettingsClient({
  userId,
  locale,
  initialUser,
}: {
  userId: string;
  locale: string;
  initialUser: UserData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, user: contextUser } = useUser();
  const [user, setUser] = useState<UserData>(initialUser);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { plan, limits, isFree, isPro, isEnterprise } = useUserPlan();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [displayName, setDisplayName] = useState(initialUser.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || "");
  const { t } = useTranslation();

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("portal_error");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
      setIsPortalLoading(false);
    }
  };

  // Connector state
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [activeConnector, setActiveConnector] = useState<{ name: string; type: ConnectorType } | null>(null);
  const [connectedServices, setConnectedServices] = useState<Record<ConnectorType, boolean>>({
    google_sheets: false,
    google_drive: false,
    google_docs: false,
    google_calendar: false,
    google_tasks: false,
  });

  const openConnectorModal = (name: string, type: ConnectorType) => {
    setActiveConnector({ name, type });
    setIsConnectorModalOpen(true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(user.name || "");
     
    setAvatarUrl(user.avatarUrl || "");
  }, [user]);

  // Handle OAuth redirects and fetch initial state
  useEffect(() => {
    const fetchServices = async () => {
      const res = await getConnectedServices();
      if (res.success && res.data) {
        setConnectedServices(res.data);
      }
    };
    fetchServices();

    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast.error(t("dashboard:settings.integration_failed") + ` ${error.replace(/_/g, " ")}`);
      // Clean up URL
      router.replace(`/${locale}/settings`);
    } else if (success) {
      toast.success(t("dashboard:settings.integration_success"));
      // Clean up URL
      router.replace(`/${locale}/settings`);
    }
  }, [searchParams, locale, router]);

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateProfile({ displayName });
    if (result.success) {
      toast.success(t("dashboard:settings.profile_updated"));
      refreshUser();
    } else {
      toast.error(result.error || t("dashboard:settings.profile_update_failed"));
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(t("dashboard:settings.uploading_avatar"));

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);

    if (result.success && result.url) {
      // Update local state immediately — no page reload needed
      setAvatarUrl(result.url);
      setUser((prev) => ({ ...prev, avatarUrl: result.url! }));
      toast.success(t("dashboard:settings.avatar_updated"), { id: toastId });
      // Refresh global UserContext so TopBar avatar updates too
      refreshUser();
    } else {
      toast.error(result.error || t("dashboard:settings.avatar_upload_failed"), { id: toastId });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    const result = await exportUserData();

    if (result.success && result.csvContent) {
      const blob = new Blob([result.csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `auxillium-user-data-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t("dashboard:settings.data_exported"));
    } else {
      toast.error(result.error || t("dashboard:settings.data_export_failed"));
    }
    setIsExporting(false);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(t("dashboard:settings.delete_confirm"))
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccountAction();

    if (result.success) {
      toast.success(t("dashboard:settings.account_deleted"));
      router.push(`/${locale}/login`);
    } else {
      toast.error(result.error || t("dashboard:settings.account_delete_failed"));
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">

      {/* ── Page Header ── */}
      <div className="mb-16">
        <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-3">
          {t("dashboard:settings.account")}
        </p>
        <h1 className="text-[40px] font-bold text-[#0A0A0A] leading-[1.1]">{t("dashboard:settings.title")}</h1>
        <p className="text-base font-light text-[#71717A] mt-3 leading-[1.65]">
          {t("dashboard:settings.subtitle")}
        </p>
      </div>

      {/* ── Profile Information ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-8">
            {t("dashboard:settings.profile_info")}
          </p>

          {/* Avatar row */}
          <div className="flex items-start gap-8 mb-10">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 bg-[#F4F4F5] flex items-center justify-center overflow-hidden border border-[#D4D4D8] group-hover:border-[#0A0A0A] transition-colors duration-150">
                {avatarUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                  </div>
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#71717A]" />
                )}
              </div>
              {/* Upload trigger — square, not rounded */}
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] text-white flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-colors duration-150">
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-bold text-[#0A0A0A]">
                {user.name || user.username}
              </p>
              <p className="text-sm font-light text-[#71717A] mt-0.5">@{user.username}</p>
              <p className="text-xs text-[#71717A] mt-3 leading-relaxed">
                {t("dashboard:settings.avatar_hint")}
              </p>
            </div>
          </div>

          {/* Display name form */}
          <form onSubmit={handleDisplayNameChange}>
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-2">
                {t("dashboard:settings.display_name")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D4D4D8] text-sm text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0A0A0A] hover:border-[#A1A1AA] transition-colors duration-150"
                placeholder={t("dashboard:settings.display_name_placeholder")}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-6 bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                    {t("dashboard:settings.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {t("dashboard:settings.save_changes")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Account Details ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            {t("dashboard:settings.account_details")}
          </p>

          {/* Username */}
          <div className="flex items-center h-12 border-b border-[#F4F4F5]">
            <div className="w-8 shrink-0 flex items-center">
              <ShieldCheck className="w-4 h-4 text-[#71717A]" />
            </div>
            <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.3em] w-36 shrink-0">
              {t("dashboard:settings.username")}
            </p>
            <p className="text-sm font-bold text-[#0A0A0A]">@{user.username}</p>
          </div>

          {/* Email */}
          <div className="flex items-center h-12 border-b border-[#F4F4F5]">
            <div className="w-8 shrink-0 flex items-center">
              <Mail className="w-4 h-4 text-[#71717A]" />
            </div>
            <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.3em] w-36 shrink-0">
              {t("dashboard:settings.email")}
            </p>
            <p className="text-sm font-bold text-[#0A0A0A]">{user.email}</p>
          </div>
        </div>
      </section>

      {/* ── Billing & Plan ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-8">
            Billing &amp; Plan
          </p>

          {/* Current Plan row */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-widest mb-2">
                Current Plan
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase border ${
                    isEnterprise
                      ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                      : isPro
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-[#D4D4D8] bg-[#F4F4F5] text-[#71717A]"
                  }`}
                >
                  <CreditCard size={11} />
                  {plan}
                </span>
                {contextUser?.renewalDate && !isFree && (
                  <span className="flex items-center gap-1.5 text-xs text-[#71717A]">
                    <Calendar size={11} />
                    Renews{" "}
                    {new Date(contextUser.renewalDate).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* CTA button */}
            {isFree ? (
              <a
                href={`/${locale}/pricing`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1a1a1a] transition-colors shrink-0"
              >
                Upgrade Plan
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <button
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D4D4D8] text-[11px] font-bold tracking-[0.2em] uppercase text-[#0A0A0A] hover:border-black transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPortalLoading ? "Loading..." : "Manage Subscription"}
              </button>
            )}
          </div>

          {/* Plan limits grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Projects", value: limits?.projects },
              { label: "Clients", value: limits?.clients },
              { label: "Leads", value: limits?.leads },
              { label: "Spaces", value: limits?.spaces },
            ].map(({ label, value }) => (
              <div key={label} className="border border-[#E4E4E7] p-4">
                <p className="text-[9px] font-bold text-[#71717A] uppercase tracking-[0.3em] mb-1">
                  {label}
                </p>
                <p className="text-lg font-black text-[#0A0A0A]">
                  {value === null ? "∞" : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connectors ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            {t("dashboard:settings.integrations")}
          </p>
          
          <div className="space-y-4">
            {/* Google Sheets */}
            <div className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white hover:border-[#A1A1AA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] flex items-center justify-center shrink-0">
                  <SiGooglesheets className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                    Google Sheets
                    {connectedServices.google_sheets && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  </p>
                  <p className="text-xs font-light text-[#71717A] mt-0.5">
                    {t("dashboard:settings.sync_sheets")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openConnectorModal("Google Sheets", "google_sheets")}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  connectedServices.google_sheets
                    ? "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#333333]"
                }`}
              >
                {connectedServices.google_sheets ? t("dashboard:settings.manage") : t("dashboard:settings.connect")}
              </button>
            </div>

            {/* Google Drive */}
            <div className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white hover:border-[#A1A1AA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] flex items-center justify-center shrink-0">
                  <SiGoogledrive className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                    Google Drive
                    {connectedServices.google_drive && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  </p>
                  <p className="text-xs font-light text-[#71717A] mt-0.5">
                    {t("dashboard:settings.sync_drive")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openConnectorModal("Google Drive", "google_drive")}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  connectedServices.google_drive
                    ? "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#333333]"
                }`}
              >
                {connectedServices.google_drive ? t("dashboard:settings.manage") : t("dashboard:settings.connect")}
              </button>
            </div>

            {/* Google Docs */}
            <div className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white hover:border-[#A1A1AA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] flex items-center justify-center shrink-0">
                  <SiGoogledocs className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                    Google Docs
                    {connectedServices.google_docs && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  </p>
                  <p className="text-xs font-light text-[#71717A] mt-0.5">
                    {t("dashboard:settings.sync_docs")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openConnectorModal("Google Docs", "google_docs")}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  connectedServices.google_docs
                    ? "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#333333]"
                }`}
              >
                {connectedServices.google_docs ? t("dashboard:settings.manage") : t("dashboard:settings.connect")}
              </button>
            </div>

            {/* Google Calendar */}
            <div className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white hover:border-[#A1A1AA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] flex items-center justify-center shrink-0">
                  <SiGooglecalendar className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                    Google Calendar
                    {connectedServices.google_calendar && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  </p>
                  <p className="text-xs font-light text-[#71717A] mt-0.5">
                    {t("dashboard:settings.sync_calendar")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openConnectorModal("Google Calendar", "google_calendar")}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  connectedServices.google_calendar
                    ? "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#333333]"
                }`}
              >
                {connectedServices.google_calendar ? t("dashboard:settings.manage") : t("dashboard:settings.connect")}
              </button>
            </div>

            {/* Google Tasks (To Do) */}
            <div className="flex items-center justify-between p-4 border border-[#E5E5E5] bg-white hover:border-[#A1A1AA] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F4F4F5] flex items-center justify-center shrink-0">
                  <SiGoogletasks className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                    Google To Do
                    {connectedServices.google_tasks && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                  </p>
                  <p className="text-xs font-light text-[#71717A] mt-0.5">
                    {t("dashboard:settings.sync_tasks")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openConnectorModal("Google To Do", "google_tasks")}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  connectedServices.google_tasks
                    ? "bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#333333]"
                }`}
              >
                {connectedServices.google_tasks ? t("dashboard:settings.manage") : t("dashboard:settings.connect")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Management ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            {t("dashboard:settings.data_management")}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">{t("dashboard:settings.export_data")}</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                {t("dashboard:settings.export_data_desc")}
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="h-10 px-6 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? t("dashboard:settings.exporting") : t("dashboard:settings.download_csv")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Account Actions ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            {t("dashboard:settings.account_actions")}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">{t("dashboard:settings.sign_out")}</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                {t("dashboard:settings.sign_out_desc")}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 px-6 border border-[#D4D4D8] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest hover:border-[#0A0A0A] transition-colors duration-150 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t("dashboard:settings.sign_out")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="border-t border-[#DC2626]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-[0.4em] mb-6">
            {t("dashboard:settings.danger_zone")}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">{t("dashboard:settings.delete_account")}</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                {t("dashboard:settings.delete_account_desc")}
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="h-10 px-6 bg-[#DC2626] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#b91c1c] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? t("dashboard:settings.deleting") : t("dashboard:settings.delete_account")}
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {activeConnector && (
        <ConnectorModal
          isOpen={isConnectorModalOpen}
          onClose={() => setIsConnectorModalOpen(false)}
          connectorName={activeConnector.name}
          connectorType={activeConnector.type}
          isConnected={connectedServices[activeConnector.type]}
          onSuccess={(isConnected) => 
            setConnectedServices(prev => ({ ...prev, [activeConnector.type]: isConnected }))
          }
        />
      )}
    </div>
  );
}
