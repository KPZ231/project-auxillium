"use client";

import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/actions/finance";
import { useTranslation } from "@/app/context/TranslationContext";
import { History } from "lucide-react";

interface AuditLogPanelProps {
  spaceId: string;
}

interface AuditLog {
  id: string;
  action: string;
  type: string;
  timestamp: string;
  user?: { name?: string; email?: string };
}

export function AuditLogPanel({ spaceId }: AuditLogPanelProps) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && logs.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getAuditLogs(spaceId).then(setLogs);
    }
  }, [isOpen, spaceId, logs.length]);

  return (
    <div className="bg-white border border-[#0A0A0A] w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex justify-between items-center hover:bg-[#FAFAFA] transition-all text-left"
      >
        <div className="flex items-center gap-4">
          <History className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
              {t("dashboard:finance.audit_log") || "Audit Log"}
            </h3>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">
              {t("dashboard:finance.audit_log_desc") || "Recent financial changes"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black tracking-[0.2em] text-[#0A0A0A] border-b-2 border-[#0A0A0A] pb-1">
          {isOpen ? "HIDE" : "VIEW"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-[#0A0A0A] p-8 max-h-[400px] overflow-y-auto bg-white">
          {logs.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#D4D4D8]">
              <p className="text-[11px] text-[#71717A] uppercase tracking-widest font-bold">No recent activity detected.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {logs.map((log) => (
                <li key={log.id} className="border-b border-[#F4F4F5] pb-6 last:border-0 last:pb-0 group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-tight">
                        {log.user?.name || log.user?.email} 
                        <span className="text-[#71717A] font-medium lowercase ml-1">{log.action.toLowerCase()}d a {log.type}</span>
                      </p>
                      <p className="text-[10px] text-[#A1A1AA] font-mono font-bold">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-[#0A0A0A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
