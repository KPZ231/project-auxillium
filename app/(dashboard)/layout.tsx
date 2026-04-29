import SidePanel from "../components/Dashboard/Dashboard/SidePanel/SidePanel";
import TopBar from "../components/Dashboard/Dashboard/TopBar/TopBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed width will be handled by the component's internal motion */}
      <SidePanel />
      
      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-400 flex flex-col">
        <TopBar />
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

