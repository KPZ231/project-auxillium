import SidePanelWrapper from "@/app/components/Dashboard/SidePanelWrapper";
import TopBar from "@/app/components/Dashboard/Dashboard/TopBar/TopBar";
import { BreadcrumbProvider } from "@/app/context/BreadcrumbContext";
import { getSpaces, getActiveSpaceId } from "@/actions/space";
import { getUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SpaceSelectionModal from "@/app/components/Dashboard/Space/SpaceSelectionModal";
import FloatingAIChat from "@/app/components/Dashboard/AI/FloatingAIChat";
import { TutorialProvider } from "@/app/context/TutorialContext";
import TutorialOverlay from "@/app/components/Dashboard/Tutorial/TutorialOverlay";
import TutorialSpotlight from "@/app/components/Dashboard/Tutorial/TutorialSpotlight";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await getUser();
  const activeSpaceId = await getActiveSpaceId();
  const spaces = await getSpaces();

  // Fetch user data for TopBar avatar
  const userData = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, avatarUrl: true },
      })
    : null;

  // If user has no spaces at all, send them to onboarding
  if (spaces.length === 0) {
    redirect(`/${locale}/onboarding`);
  }

  // Determine if we need to show the space selector
  const showSelector = !activeSpaceId;

  return (
    <BreadcrumbProvider>
      <TutorialProvider>
        <div className="flex min-h-screen bg-gray-50 relative">
          {/* Sidebar - dynamically chosen based on route */}
          <div className="print:hidden">
            <SidePanelWrapper />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 transition-all duration-400 flex flex-col print:p-0 print:m-0 print:bg-white">
            <div className="print:hidden">
              <TopBar initialUser={userData} />
            </div>
            <div className="p-4 md:p-8 flex-1 print:p-0 print:m-0">
              {children}
            </div>
          </main>

          {/* Global AI Chat */}
          <div className="print:hidden">
            <FloatingAIChat spaceId={activeSpaceId || null} />
          </div>
        </div>
        {showSelector && <SpaceSelectionModal spaces={spaces} />}
        {!showSelector && <TutorialOverlay locale={locale} />}
        {!showSelector && <TutorialSpotlight />}
      </TutorialProvider>
    </BreadcrumbProvider>
  );
}

