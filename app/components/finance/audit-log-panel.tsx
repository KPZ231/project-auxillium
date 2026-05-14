"use client";

import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/actions/finance";

interface AuditLogPanelProps {
  spaceId: string;
}

export function AuditLogPanel({ spaceId }: AuditLogPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && logs.length === 0) {
      getAuditLogs(spaceId).then(setLogs);
    }
  }, [isOpen, spaceId, logs.length]);

  return (
    <div className="bg-white border border-[#E5E5E5] w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0A0A0A]">Audit Log</h3>
          <p className="text-[10px] text-[#71717A] uppercase tracking-widest mt-1">Recent financial changes</p>
        </div>
        <span className="text-[12px] font-black text-[#0A0A0A]">{isOpen ? "HIDE" : "SHOW"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-[#E5E5E5] p-6 max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-[12px] text-[#71717A]">No recent activity.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.id} className="border-b border-[#F4F4F5] pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[12px] font-semibold text-[#0A0A0A]">
                        {log.user?.name || log.user?.email} <span className="text-[#71717A] font-normal">{log.action.toLowerCase()}d a</span> {log.type}
                      </p>
                      <p className="text-[10px] text-[#A1A1AA] mt-1 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
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
