"use client";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import { Plus } from "lucide-react";

export default function LeadsPage() {
    return (
        <div className="flex flex-col w-full">
            <PageHeader 
                title="Potential Leads" 
                subtitle="Track and manage your upcoming opportunities."
                primaryAction={{
                    label: "ADD LEAD",
                    href: "/dashboard/leads/new",
                    icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
                }}
            />
            <div className="p-8">
                {/* Treść strony Leads */}
                <p className="text-gray-500 italic">No leads found at the moment. Start by adding a new lead.</p>
            </div>
        </div>
    )
}