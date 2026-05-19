"use client";

import React, { useState, useEffect } from "react";
import { getEmployees } from "@/actions/employee";
import { motion } from "motion/react";

interface MemberSelectorProps {
  onSelect: (employeeId: string) => void;
  assignedIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

interface Employee {
  id: string;
  name: string;
  role?: string;
}

export function MemberSelector({ onSelect, assignedIds, isOpen, onClose }: MemberSelectorProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const data = await getEmployees();
          setEmployees(data);
        } catch (error) {
          console.error("Failed to fetch employees", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-white/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white border border-[#E5E5E5] shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-[#E5E5E5] flex justify-between items-center">
          <h3 className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">
            Assign Team Member
          </h3>
          <button type="button" onClick={onClose} className="text-[#71717A] hover:text-[#0A0A0A]">
            ✕
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-3 bg-[#FAFAFA] border border-[#D4D4D8] rounded-none focus:border-[#0A0A0A] outline-none text-[14px]"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-[12px] text-[#71717A] uppercase tracking-widest animate-pulse">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-[#71717A]">
              No employees found in this space.
            </div>
          ) : (
            <div className="divide-y divide-[#F4F4F5]">
              {filteredEmployees.map((emp) => {
                const isAssigned = assignedIds.includes(emp.id);
                return (
                  <button
                    type="button"
                    key={emp.id}
                    onClick={() => {
                      if (!isAssigned) {
                        onSelect(emp.id);
                        onClose();
                      }
                    }}
                    disabled={isAssigned}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${
                      isAssigned ? "opacity-50 cursor-not-allowed bg-[#FAFAFA]" : "hover:bg-[#F4F4F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center font-bold text-[12px]">
                        {emp.name[0].toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="text-[14px] font-medium text-[#0A0A0A]">{emp.name}</div>
                        <div className="text-[11px] text-[#71717A] uppercase tracking-wider">{emp.role || "No Role"}</div>
                      </div>
                    </div>
                    {isAssigned && (
                      <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest">
                        Assigned
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent text-[#0A0A0A] text-[12px] font-medium uppercase tracking-[0.04em] border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FAFAFA] transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
