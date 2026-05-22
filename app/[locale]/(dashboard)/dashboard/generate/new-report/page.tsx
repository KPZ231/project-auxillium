import React from "react";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";
import { redirect } from "next/navigation";
import ReportClient from "./ReportClient";

export default async function NewReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn } = await getUser();

  if (!isAuthenticatedAndLogedIn) {
    redirect(`/${locale}/login`);
  }

  const spaceId = await getActiveSpaceId();

  return (
    <div className="w-full flex flex-col print:p-0 print:m-0">
      <ReportClient spaceId={spaceId ?? null} locale={locale} />
    </div>
  );
}
