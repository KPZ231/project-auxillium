"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConnectorType, connectService, disconnectService } from "@/actions/connectors";

interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorName: string;
  connectorType: ConnectorType;
  isConnected: boolean;
  onSuccess: (isConnected: boolean) => void;
}

export const ConnectorModal = ({
  isOpen,
  onClose,
  connectorName,
  connectorType,
  isConnected,
  onSuccess,
}: ConnectorModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      if (isConnected) {
        const res = await disconnectService(connectorType);
        if (res.success) {
          toast.success(res.message);
          onSuccess(false);
          onClose();
        } else {
          toast.error(res.error || "Failed to disconnect");
        }
      } else {
        const res = await connectService(connectorType);
        if (res.success && res.url) {
          window.location.href = res.url;
        } else {
          toast.error(res.error || "Failed to initiate connection");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#FAFAFA] border border-[#0A0A0A] shadow-2xl p-8"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
                {isConnected ? "Disconnect" : "Connect"} {connectorName}
              </h2>
              <p className="text-[11px] text-[#71717A] uppercase tracking-widest mt-1">
                Integration Settings
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="mb-8">
            {isConnected ? (
              <div className="flex gap-4 items-start bg-[#FEF2F2] border border-[#DC2626] p-4">
                <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-[#DC2626] uppercase tracking-wider mb-1">
                    Confirm Disconnection
                  </p>
                  <p className="text-[11px] text-[#DC2626]">
                    Are you sure you want to disconnect {connectorName}? Some features may no longer work.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-start bg-[#F0FDF4] border border-[#16A34A] p-4">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-[#16A34A] uppercase tracking-wider mb-1">
                    Setup Connection
                  </p>
                  <p className="text-[11px] text-[#16A34A]">
                    You are about to connect Auxilium with {connectorName}. This will require you to authorize access.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] border border-[#0A0A0A] hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={isSubmitting}
              className={`px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50 ${
                isConnected 
                  ? "bg-[#DC2626] hover:bg-[#b91c1c]" 
                  : "bg-[#0A0A0A] hover:bg-black/90"
              }`}
            >
              {isSubmitting ? "Processing..." : isConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
