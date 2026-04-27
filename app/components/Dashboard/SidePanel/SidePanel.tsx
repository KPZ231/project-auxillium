"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  ClipboardList,
  UserSearch,
  Users,
  Contact2,
  MessageSquareCode,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import ProfileModal from "../ProfileModal/ProfileModal";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  {
    name: "DASHBOARD",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "PROJECTS",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    name: "COSTS & EXPENSES",
    href: "/dashboard/expenses-costs",
    icon: Receipt,
  },
  {
    name: "TASKS",
    href: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    name: "LEAD SEARCH",
    href: "/dashboard/lead-search",
    icon: UserSearch,
  },
  {
    name: "LEADS",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    name: "CLIENTS",
    href: "/dashboard/clients",
    icon: Contact2,
  },
  {
    name: "AI CHAT",
    href: "/dashboard/ai",
    icon: MessageSquareCode,
  },
];

export default function SidePanel() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    expanded: { width: "280px", x: 0 },
    collapsed: { width: "80px", x: 0 },
    mobileHidden: { x: "-100%" },
    mobileOpen: { x: 0 },
  };

  return (
    <>
      {/* Mobile Toggle Button (Floating Hamburger) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-70 hover:scale-110 active:scale-95 transition-transform"
      >
        {isMobileOpen ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>

      {/* Backdrop for mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-45 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial="expanded"
        animate={
          isMobile
            ? isMobileOpen
              ? "mobileOpen"
              : "mobileHidden"
            : isCollapsed
              ? "collapsed"
              : "expanded"
        }
        variants={sidebarVariants}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 500,
          damping: 50,
        }}
        className={`h-screen bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm transition-[width] ${
          isMobile ? "fixed left-0 top-0 w-[280px]" : "sticky top-0"
        }`}
      >
        {/* Header with Logo */}
        <div className="p-6 border-b border-gray-200 relative">
          <div>
            <Link
              href="/"
              className="flex items-center gap-3 overflow-hidden h-16"
            >
              <div className="min-w-[40px] h-10 relative shrink-0">
                <Image
                  src="/images/auxillium-logo-3.png"
                  alt="Auxillium Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <h1 className="text-xl font-black tracking-tighter text-black uppercase">
                      Auxillium
                    </h1>
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest">
                      V1.0.4
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Desktop Collapse Toggle Button (Hover Trigger) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-8 h-8 items-center justify-center shadow-md hover:shadow-lg hover:bg-black hover:text-white transition-all duration-300 z-60 group/toggle"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 transition-transform group-hover/toggle:scale-110" />
            ) : (
              <ChevronLeft className="w-4 h-4 transition-transform group-hover/toggle:scale-110" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 group relative ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <link.icon
                      className={`w-5 h-5 min-w-[20px] transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs font-bold tracking-wider whitespace-nowrap uppercase"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute left-0 w-1 h-full bg-black"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`flex items-center gap-3 w-full hover:bg-gray-100 p-2 rounded-xl transition-colors ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <p className="text-xs font-bold text-black truncate uppercase">
                  {user?.name || user?.username || "Admin"}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {user?.email || "admin@auxillium.com"}
                </p>
              </div>
            )}
          </button>
        </div>

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </motion.aside>
    </>
  );
}
