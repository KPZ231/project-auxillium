"use client";
import { useState } from "react";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import LeadsFilter from "@/app/components/Dashboard/Dashboard/Leads/LeadsFilter/LeadsFilters";
import LeadsGrid from "@/app/components/Dashboard/Dashboard/Leads/LeadsGrid/LeadsGrid";
import { Plus } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";

export default function LeadsPage() {
    const [selectedFilter, setSelectedFilter] = useState("ALL ACTIVE");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState("Manual Order");
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useTranslation();

    return (
        <div className="flex flex-col w-full">
            <PageHeader 
                title={t("dashboard:leads.page_title", "Potential Leads")} 
                subtitle={t("dashboard:leads.page_subtitle", "Track and manage your upcoming opportunities.")}
                primaryAction={{
                    label: t("dashboard:leads.add_lead", "ADD LEAD"),
                    href: "/dashboard/leads/new",
                    icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
                }}
            />

            <LeadsFilter
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                view={view}
                onViewChange={setView}
                sortBy={sortBy}
                onSortChange={setSortBy}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />


            <div className="p-8">
                <LeadsGrid 
                    selectedFilter={selectedFilter}
                    view={view}
                    sortBy={sortBy}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    )
}