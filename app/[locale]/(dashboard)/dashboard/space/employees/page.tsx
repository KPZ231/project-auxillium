import React from "react";
import { getEmployees } from "@/actions/employee";
import EmployeeListClient from "@/app/components/Dashboard/Space/EmployeeListClient";
import { Settings2 } from "lucide-react";
import Link from "next/link";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const employees = await getEmployees();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">EMPLOYEES</h1>
          <p className="text-slate-500 mt-1">Manage your team members and their workloads.</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/dashboard/space/members`}>
            <button type="button" className="flex items-center justify-center px-4 h-10 rounded-none border border-zinc-900 text-zinc-900 hover:bg-zinc-100 text-sm font-medium transition-colors">
              <Settings2 className="w-4 h-4 mr-2" />
              Zarządzaj zespołem
            </button>
          </Link>
        </div>
      </div>

      <EmployeeListClient initialEmployees={employees} />
    </div>
  );
}
