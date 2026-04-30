"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";
import { Breadcrumbs } from "@/app/components/UI/Breadcrumbs";
import ProfileModal from "../ProfileModal/ProfileModal";

export default function TopBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  
  return (
    <>
      <header className="h-14 w-full flex items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center">
          <Breadcrumbs />
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
