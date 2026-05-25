import React from "react";
import { getSpaces, getActiveSpaceId, getActiveSpace } from "@/actions/space";
import SpaceSettingsClient from "@/app/components/Dashboard/Space/SpaceSettingsClient";
import { Settings } from "lucide-react";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";

export default async function SpaceSettingsPage() {
  const spaces = await getSpaces();
  const activeSpaceId = await getActiveSpaceId();
  const activeSpace = await getActiveSpace();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <PageHeader 
        title="dashboard:space_settings.title" 
        subtitle="dashboard:space_settings.subtitle" 
      />

      <SpaceSettingsClient 
        initialSpaces={spaces} 
        activeSpaceId={activeSpaceId}
        activeSpace={activeSpace}
      />
    </div>
  );
}
