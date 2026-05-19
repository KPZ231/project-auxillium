import React from "react";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";
import { getTemplates } from "@/actions/templates";
import { redirect } from "next/navigation";
import { TemplateCard } from "@/app/components/templates/TemplateCard";
import { TemplateListHeader } from "@/app/components/templates/TemplateListHeader";

export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn } = await getUser();
  
  if (!isAuthenticatedAndLogedIn) {
    redirect(`/${locale}/login`);
  }

  const spaceId = await getActiveSpaceId();
  
  if (!spaceId) {
    return (
      <div className="flex h-full items-center justify-center text-[#71717A] text-[14px]">
        Proszę wybierz przestrzeń, aby zarządzać szablonami.
      </div>
    );
  }

  const templatesResponse = await getTemplates(spaceId);
  const templates = templatesResponse.success && templatesResponse.templates ? templatesResponse.templates : [];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <TemplateListHeader spaceId={spaceId} />
      
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-[#71717A] mb-1 font-medium">Brak szablonów</p>
          <p className="text-[#A1A1AA] text-sm">Utwórz swój pierwszy szablon dokumentu, aby zacząć.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
