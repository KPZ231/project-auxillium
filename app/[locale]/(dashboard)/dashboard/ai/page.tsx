import { getActiveSpaceId } from "@/actions/space";
import { getUser } from "@/lib/session";
import { getUserPlanById } from "@/lib/subscription";
import { redirect } from "next/navigation";
import AIChatClient from "./AIChatClient";
import UpgradePrompt from "@/app/components/subscription/UpgradePrompt";

export const metadata = {
  title: "AI Assistant | Auxilium",
  description: "Chat with your AI assistant about your business data.",
};

export default async function AIChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await getUser();
  const activeSpaceId = await getActiveSpaceId();

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  const { plan, features } = await getUserPlanById(userId);

  if (!features.ai) {
    return (
      <UpgradePrompt
        feature="AI Assistant"
        requiredPlan="PRO"
        currentPlan={plan}
        locale={locale}
      />
    );
  }

  if (!activeSpaceId) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full mx-auto bg-white border border-[#E5E5E5]">
      <div className="p-6 border-b border-[#E5E5E5]">
        <h1 className="text-h2 text-primary font-semibold m-0 leading-tight">
          AI Assistant
        </h1>
        <p className="text-body-sm text-tertiary mt-2">
          Ask questions about your projects, leads, tasks, and finances.
        </p>
      </div>

      <AIChatClient spaceId={activeSpaceId!} />
    </div>
  );
}
