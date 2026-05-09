import React from "react";
import { getEmployeeById } from "@/actions/employee";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Shield, 
  Calendar,
  FolderKanban,
  CheckCircle2,
  Clock,
  CheckSquare,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  const activeProjects = employee.assignedProjects.filter((p: any) => p.projectStatus === "IN_PROGRESS");
  const activeTasks = employee.assignedTasks.filter((t: any) => t.status !== "DONE");

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-8">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-black pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
          <div className="w-48 h-48 bg-black flex items-center justify-center text-white text-7xl font-black rounded-none">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-4 text-center md:text-left">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] font-mono">ID: {employee.id.slice(0,8)}</span>
              <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase leading-[0.9]">{employee.name}</h1>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                {employee.role || "No Role"}
              </span>
              <span className="px-4 py-2 border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Since {new Date(employee.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="px-8 py-4 border border-black text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all rounded-none">
             Edit Profile
           </button>
           <button className="px-8 py-4 bg-black text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all rounded-none">
             Assign Task
           </button>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* LEFT COLUMN: CONTACT */}
        <div className="lg:col-span-1 space-y-12">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.4em] border-b border-slate-100 pb-4">Contact Details</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Email</span>
                  <span className="text-sm font-mono font-bold text-black uppercase">{employee.email || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Direct</span>
                  <span className="text-sm font-mono font-bold text-black uppercase">{employee.phone || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.4em] border-b border-slate-100 pb-4">Permissions</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Standard Member</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKLOAD */}
        <div className="lg:col-span-2 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200">
            <div className="p-12 border-r border-slate-200 space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Active Projects</h4>
                  <Briefcase className="w-4 h-4 text-slate-300" />
               </div>
               <p className="text-7xl font-black text-black tracking-tighter leading-none">{activeProjects.length}</p>
               <p className="text-[10px] font-mono text-slate-400 uppercase">Operational Workload</p>
            </div>
            <div className="p-12 space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Pending Tasks</h4>
                  <CheckSquare className="w-4 h-4 text-slate-300" />
               </div>
               <p className="text-7xl font-black text-black tracking-tighter leading-none">{activeTasks.length}</p>
               <p className="text-[10px] font-mono text-slate-400 uppercase">Task Queue</p>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.4em] border-b border-black pb-4">Current Engagements</h3>
            {activeProjects.length === 0 ? (
              <div className="py-24 border border-dashed border-slate-200 text-center">
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">No active assignments found.</p>
              </div>
            ) : (
              <div className="space-y-0 border-t border-slate-200">
                 {activeProjects.map((project: any) => (
                   <Link 
                    key={project.id} 
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-8 border-b border-slate-200 hover:bg-slate-50 transition-all group"
                   >
                      <div className="flex items-center gap-8">
                        <div className="w-2 h-2 bg-black"></div>
                        <div className="flex flex-col">
                           <span className="font-black text-xl uppercase tracking-tighter">{project.projectName}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Project Active</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <span className="text-[10px] font-bold text-black border border-black px-4 py-1 uppercase tracking-[0.2em]">IN PROGRESS</span>
                         <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-black transition-colors" />
                      </div>
                   </Link>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
