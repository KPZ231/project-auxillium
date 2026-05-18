"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Upload, Download, Trash2, LogOut, Mail, ShieldCheck, Save, Image as ImageIcon, Link, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiGooglesheets, SiGoogledrive, SiGoogledocs, SiGooglecalendar, SiGoogletasks } from "react-icons/si";
import { uploadAvatar } from "@/actions/uploadAvatar";
import { ConnectorModal } from "@/app/components/settings/ConnectorModal";
import { ConnectorType, getConnectedServices } from "@/actions/connectors";
import { updateProfile } from "@/actions/updateProfile";
import { exportUserData } from "@/actions/exportUserData";
import { deleteAccountAction } from "@/actions/updateProfile";
import { logoutAction } from "@/actions/logout";
import { useUser } from "@/app/context/UserContext";

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
  const { refreshUser } = useUser();
  const [user, setUser] = useState<UserData>(initialUser);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayName, setDisplayName] = useState(initialUser.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || "");

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
      toast.error(`Integration failed: ${error.replace(/_/g, " ")}`);
      // Clean up URL
      router.replace(`/${locale}/settings`);
    } else if (success) {
      toast.success("Integration connected successfully!");
      // Clean up URL
      router.replace(`/${locale}/settings`);
    }
  }, [searchParams, locale, router]);

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateProfile({ displayName });
    if (result.success) {
      toast.success("Profile updated successfully!");
      refreshUser();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading avatar...");

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);

    if (result.success && result.url) {
      // Update local state immediately — no page reload needed
      setAvatarUrl(result.url);
      setUser((prev) => ({ ...prev, avatarUrl: result.url! }));
      toast.success("Avatar updated!", { id: toastId });
      // Refresh global UserContext so TopBar avatar updates too
      refreshUser();
    } else {
      toast.error(result.error || "Failed to upload avatar", { id: toastId });
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
      toast.success("Data exported successfully!");
    } else {
      toast.error(result.error || "Failed to export data");
    }
    setIsExporting(false);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm("Are you sure you want to delete your account? This action cannot be undone!")
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccountAction();

    if (result.success) {
      toast.success("Account deleted successfully!");
      router.push(`/${locale}/login`);
    } else {
      toast.error(result.error || "Failed to delete account");
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">

      {/* ── Page Header ── */}
      <div className="mb-16">
        <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-3">
          Account
        </p>
        <h1 className="text-[40px] font-bold text-[#0A0A0A] leading-[1.1]">Settings</h1>
        <p className="text-base font-light text-[#71717A] mt-3 leading-[1.65]">
          Manage your profile and account preferences
        </p>
      </div>

      {/* ── Profile Information ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-8">
            Profile Information
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
                Click the upload icon to change your profile photo.
              </p>
            </div>
          </div>

          {/* Display name form */}
          <form onSubmit={handleDisplayNameChange}>
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D4D4D8] text-sm text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0A0A0A] hover:border-[#A1A1AA] transition-colors duration-150"
                placeholder="Enter your display name"
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
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
            Account Details
          </p>

          {/* Username */}
          <div className="flex items-center h-12 border-b border-[#F4F4F5]">
            <div className="w-8 shrink-0 flex items-center">
              <ShieldCheck className="w-4 h-4 text-[#71717A]" />
            </div>
            <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.3em] w-36 shrink-0">
              Username
            </p>
            <p className="text-sm font-bold text-[#0A0A0A]">@{user.username}</p>
          </div>

          {/* Email */}
          <div className="flex items-center h-12 border-b border-[#F4F4F5]">
            <div className="w-8 shrink-0 flex items-center">
              <Mail className="w-4 h-4 text-[#71717A]" />
            </div>
            <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.3em] w-36 shrink-0">
              Email
            </p>
            <p className="text-sm font-bold text-[#0A0A0A]">{user.email}</p>
          </div>
        </div>
      </section>

      {/* ── Connectors ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            Integrations & Connectors
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
                    Sync financial data and reports directly to sheets
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
                {connectedServices.google_sheets ? "Manage" : "Connect"}
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
                    Store and organize project receipts and attachments
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
                {connectedServices.google_drive ? "Manage" : "Connect"}
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
                    Generate and export proposals and invoices
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
                {connectedServices.google_docs ? "Manage" : "Connect"}
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
                    Sync project deadlines and events with your calendar
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
                {connectedServices.google_calendar ? "Manage" : "Connect"}
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
                    Export and sync CRM tasks with Google Tasks
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
                {connectedServices.google_tasks ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Management ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            Data Management
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">Export User Data</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                Download your personal data as CSV
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="h-10 px-6 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest hover:bg-[#0A0A0A] hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Account Actions ── */}
      <section className="border-t border-[#D4D4D8]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.4em] mb-6">
            Account Actions
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">Sign Out</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                End your current session
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 px-6 border border-[#D4D4D8] text-[#0A0A0A] text-xs font-bold uppercase tracking-widest hover:border-[#0A0A0A] transition-colors duration-150 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="border-t border-[#DC2626]">
        <div className="py-10">
          <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-[0.4em] mb-6">
            Danger Zone
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A0A0A]">Delete Account</p>
              <p className="text-xs font-light text-[#71717A] mt-1">
                Permanently remove your account and all data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="h-10 px-6 bg-[#DC2626] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#b91c1c] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? "Deleting..." : "Delete Account"}
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
