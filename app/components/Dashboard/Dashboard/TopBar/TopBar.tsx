"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";
import ProfileModal from "../ProfileModal/ProfileModal";

export default function TopBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "OVERVIEW";
    if (pathname.includes("projects")) return "PROJECTS";
    if (pathname.includes("expenses-costs")) return "COSTS & EXPENSES";
    if (pathname.includes("tasks")) return "TASKS";
    if (pathname.includes("lead-search")) return "LEAD SEARCH";
    if (pathname.includes("leads")) return "LEADS";
    if (pathname.includes("clients")) return "CLIENTS";
    if (pathname.includes("ai")) return "AI CHAT";
    return "OVERVIEW";
  };

  return (
    <>
      <header className="h-14 w-full flex items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center">
          <h2 className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-800">
            {getPageTitle()}
          </h2>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-black transition">
            <Bell className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-black transition">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 bg-black flex items-center justify-center cursor-pointer transition hover:bg-gray-800"
          >
             <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
