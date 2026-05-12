import SidePanelWrapper from "@/app/components/Dashboard/SidePanelWrapper";
import TopBar from "@/app/components/Dashboard/Dashboard/TopBar/TopBar";
import { BreadcrumbProvider } from "@/app/context/BreadcrumbContext";
import { getSpaces, getActiveSpaceId } from "@/actions/space";
import { redirect } from "next/navigation";
import SpaceSelectionModal from "@/app/components/Dashboard/Space/SpaceSelectionModal";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeSpaceId = await getActiveSpaceId();
  const spaces = await getSpaces();
  
  // If user has no spaces at all, send them to onboarding
  if (spaces.length === 0) {
    redirect(`/${locale}/onboarding`);
  }

  // Determine if we need to show the space selector
  const showSelector = !activeSpaceId;

  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - dynamically chosen based on route */}
      <SidePanelWrapper />
      
      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-400 flex flex-col">
        <TopBar />
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
      </div>
      {showSelector && <SpaceSelectionModal spaces={spaces} />}
    </BreadcrumbProvider>
  );
}

