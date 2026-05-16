import React from "react";
import { getUser } from "@/lib/session";
import { getTemplateById } from "@/actions/templates";
import { redirect, notFound } from "next/navigation";
import { TemplateEditor } from "@/app/components/templates/TemplateEditor";

export default async function EditTemplatePage({ 
  params 
}: { 
  params: Promise<{ locale: string, templateId: string }> 
}) {
  const { locale, templateId } = await params;
  const { isAuthenticatedAndLogedIn } = await getUser();
  
  if (!isAuthenticatedAndLogedIn) {
    redirect(`/${locale}/login`);
  }

  const res = await getTemplateById(templateId);
  
  if (!res.success || !res.template) {
    notFound();
  }

  return <TemplateEditor template={res.template} />;
}
