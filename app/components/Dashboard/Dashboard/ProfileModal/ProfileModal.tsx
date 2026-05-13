"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, ShieldCheck, Settings, LogOut } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/logout";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useUser();
  const router = useRouter();

  const handleSettingsClick = () => {
    onClose();
    const locale = window.location.pathname.split("/")[1] || "en";
    router.push(`/${locale}/settings`);
  };

  const handleLogoutClick = async () => {
    onClose();
    await logoutAction();
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-100 backdrop-blur-md"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-101 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto border border-gray-100"
            >
              {/* Header */}
              <div className="bg-black p-8 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10  transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16  bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      Profil Użytkownika
                    </h2>
                    <p className="text-white/60 text-xs font-bold tracking-widest uppercase">
                      Auxillium Management
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-4">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50  border border-gray-100 group transition-all hover:bg-gray-100">
                    <div className="w-10 h-10  bg-white flex items-center justify-center shadow-sm text-black">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Imię i Nazwisko
                      </p>
                      <p className="font-bold text-black text-sm">
                        {user.name || "Nie podano"}
                      </p>
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50  border border-gray-100 group transition-all hover:bg-gray-100">
                    <div className="w-10 h-10  bg-white flex items-center justify-center shadow-sm text-black">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Nazwa użytkownika
                      </p>
                      <p className="font-bold text-black text-sm">{user.username}</p>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50  border border-gray-100 group transition-all hover:bg-gray-100">
                    <div className="w-10 h-10  bg-white flex items-center justify-center shadow-sm text-black">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Adres Email
                      </p>
                      <p className="font-bold text-black text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Ustawienia
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFF1F2] border border-[#EF4444] text-[#EF4444] font-bold uppercase tracking-widest text-xs hover:bg-[#FEE2E2] transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Wyloguj
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
