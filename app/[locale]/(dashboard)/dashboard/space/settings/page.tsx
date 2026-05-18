import React from "react";
import { getSpaces, getActiveSpaceId, getActiveSpace } from "@/actions/space";
import SpaceSettingsClient from "@/app/components/Dashboard/Space/SpaceSettingsClient";
import { Settings } from "lucide-react";

export default async function SpaceSettingsPage() {
  const spaces = await getSpaces();
  const activeSpaceId = await getActiveSpaceId();
  const activeSpace = await getActiveSpace();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Space Settings</h1>
        <p className="text-slate-500 font-medium">Manage your operational units and workspaces.</p>
      </div>

      <SpaceSettingsClient 
        initialSpaces={spaces} 
        activeSpaceId={activeSpaceId}
        activeSpace={activeSpace}
      />
    </div>
  );
}
