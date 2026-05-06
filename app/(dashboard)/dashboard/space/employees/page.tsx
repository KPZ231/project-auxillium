import React from "react";
import { getEmployees } from "@/actions/employee";
import EmployeeListClient from "@/app/components/Dashboard/Space/EmployeeListClient";
import { Users, UserPlus } from "lucide-react";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">EMPLOYEES</h1>
          <p className="text-slate-500 mt-1">Manage your team members and their workloads.</p>
        </div>
      </div>

      <EmployeeListClient initialEmployees={employees} />
    </div>
  );
}
