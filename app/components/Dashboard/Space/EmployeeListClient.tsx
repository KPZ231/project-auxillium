"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Briefcase,
  LayoutGrid,
  List as ListIcon,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import EmployeeForm from "./EmployeeForm";

interface EmployeeListClientProps {
  initialEmployees: any[];
}

export default function EmployeeListClient({ initialEmployees }: EmployeeListClientProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-0 items-center justify-between bg-white border border-slate-200">
        <div className="relative w-full md:w-96 border-r border-slate-200">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-none text-sm font-bold placeholder:text-slate-300 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-0 w-full md:w-auto">
          <div className="flex border-l border-slate-200">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-4 transition-all ${viewMode === "grid" ? "bg-black text-white" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-4 transition-all border-l border-slate-200 ${viewMode === "list" ? "bg-black text-white" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all border-l border-slate-200"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* EMPLOYEES GRID/LIST */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map((employee) => (
              <motion.div
                key={employee.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group bg-white rounded-none p-8 border border-slate-200 hover:border-black transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-none bg-slate-100 flex items-center justify-center text-black text-2xl font-black group-hover:bg-black group-hover:text-white transition-colors">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="p-2 text-slate-300 hover:text-black transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-black text-black leading-tight uppercase tracking-tighter">{employee.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{employee.role || "No Role Assigned"}</p>
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 space-y-3 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <Mail className="w-3 h-3" />
                      <span className="truncate uppercase">{employee.email || "No Email"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-3 h-3" />
                      <span className="uppercase">{employee.phone || "No Phone"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] leading-none">Activity</span>
                    <span className="text-xs font-bold text-black mt-2 uppercase">
                      {employee._count?.assignedProjects || 0}P / {employee._count?.assignedTasks || 0}T
                    </span>
                  </div>
                  <Link 
                    href={`/dashboard/space/employees/${employee.id}`}
                    className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all border border-transparent hover:border-black"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-none border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.3em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.3em]">Position</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.3em]">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.3em]">Workload</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center text-black font-bold group-hover:bg-black group-hover:text-white transition-colors">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-black text-black uppercase tracking-tighter">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-xs text-slate-500 uppercase tracking-widest">{employee.role || "—"}</td>
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-400 uppercase">{employee.email || employee.phone || "—"}</td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-black border border-black px-3 py-1 rounded-none uppercase">
                       {employee._count?.assignedProjects || 0}P / {employee._count?.assignedTasks || 0}T
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/dashboard/space/employees/${employee.id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-none text-slate-400 hover:bg-black hover:text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <EmployeeForm 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={(newEmp: any) => {
              setEmployees([newEmp, ...employees]);
              setIsFormOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
