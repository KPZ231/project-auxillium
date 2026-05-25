import { getUser } from "@/lib/session";
import { getUserPlanById } from "@/lib/subscription";
import UpgradePrompt from "@/app/components/subscription/UpgradePrompt";
import LeadSearchClientPage from "./LeadSearchClientPage";

export default async function LeadSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn, userId } = await getUser();

  if (!isAuthenticatedAndLogedIn || !userId) {
    return null; // auth middleware handles redirect
  }

  const { plan, features } = await getUserPlanById(userId);

  if (!features.search) {
    return (
      <UpgradePrompt
        feature="Lead Search"
        requiredPlan="PRO"
        currentPlan={plan}
        locale={locale}
      />
    );
  }

  return <LeadSearchClientPage locale={locale} />;
}
