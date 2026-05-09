import React from "react";
import { getUser } from "@/lib/session";
import { getActiveSpaceId } from "@/actions/space";
import { getFinancialSummary } from "@/actions/finance";
import { FinanceDashboardClient } from "@/app/components/finance/finance-dashboard-client";
import { redirect } from "next/navigation";

export default async function CostsExpensesPage() {
  const { isAuthenticatedAndLogedIn, userId } = await getUser();
  
  if (!isAuthenticatedAndLogedIn || !userId) {
    redirect("/login");
  }

  const spaceId = await getActiveSpaceId();
  
  if (!spaceId) {
    // If no space, they should probably be redirected to space selection or onboarding
    // For now, we'll just handle it gracefully in the UI or redirect
    redirect("/dashboard");
  }

  const initialSummary = await getFinancialSummary(spaceId);

  return (
    <FinanceDashboardClient 
      initialData={initialSummary} 
      userId={userId} 
      spaceId={spaceId} 
    />
  );
}
