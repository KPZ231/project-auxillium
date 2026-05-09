import SidePanelWrapper from "@/app/components/Dashboard/SidePanelWrapper";
import TopBar from "@/app/components/Dashboard/Dashboard/TopBar/TopBar";
import { BreadcrumbProvider } from "@/app/context/BreadcrumbContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    </BreadcrumbProvider>
  );
}

