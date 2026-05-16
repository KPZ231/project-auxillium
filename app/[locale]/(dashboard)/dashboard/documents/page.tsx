import React from "react";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";
import { getGeneratedDocuments } from "@/actions/templates";
import { redirect } from "next/navigation";
import { GeneratedDocumentCard } from "@/app/components/templates/GeneratedDocumentCard";
import { DocumentHubHeader } from "@/app/components/templates/DocumentHubHeader";

export default async function DocumentHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn } = await getUser();
  
  if (!isAuthenticatedAndLogedIn) {
    redirect(`/${locale}/login`);
  }

  const spaceId = await getActiveSpaceId();
  
  if (!spaceId) {
    return (
      <div className="flex h-full items-center justify-center text-[#71717A] text-[14px]">
        Proszę wybierz przestrzeń, aby przeglądać dokumenty.
      </div>
    );
  }

  const response = await getGeneratedDocuments(spaceId);
  const documents = response.success && response.documents ? response.documents : [];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <DocumentHubHeader language={locale} spaceId={spaceId} />
      
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-[#71717A] mb-1 font-medium">Brak utworzonych dokumentów</p>
          <p className="text-[#A1A1AA] text-sm mb-6">Generuj dokumenty z poziomu edytora szablonów.</p>
          <a 
            href={`/${locale}/dashboard/templates`}
            className="text-xs font-bold uppercase tracking-widest hover:underline text-[#0A0A0A]"
          >
            Przejdź do szablonów &rarr;
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc: { id: string; title: string; content: string; createdAt: string }) => (
            <GeneratedDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
