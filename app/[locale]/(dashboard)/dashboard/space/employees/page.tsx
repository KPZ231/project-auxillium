import React from "react";
import { getEmployees } from "@/actions/employee";
import EmployeeListClient from "@/app/components/Dashboard/Space/EmployeeListClient";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const employees = await getEmployees();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="dashboard:employees.title" 
        subtitle="dashboard:employees.subtitle"
        secondaryAction={{
          label: "dashboard:employees.manage_members",
          href: `/${locale}/dashboard/space/members`,
          icon: <Settings2 className="w-4 h-4 mr-2" />
        }}
      />

      <div data-tutorial="employees-action">
        <EmployeeListClient initialEmployees={employees} />
      </div>
    </div>
  );
}
