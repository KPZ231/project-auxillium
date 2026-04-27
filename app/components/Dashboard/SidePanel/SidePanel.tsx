"use client";

import React, { useEffect, useState } from "react";
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
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "PROJECTS", href: "/dashboard/projects", icon: FolderKanban },
  { name: "COSTS & EXPENSES", href: "/dashboard/expenses-costs", icon: Receipt },
  { name: "TASKS", href: "/dashboard/tasks", icon: ClipboardList },
  { name: "LEAD SEARCH", href: "/dashboard/lead-search", icon: UserSearch },
  { name: "LEADS", href: "/dashboard/leads", icon: Users },
  { name: "CLIENTS", href: "/dashboard/clients", icon: Contact2 },
  { name: "AI CHAT", href: "/dashboard/ai", icon: MessageSquareCode },
];

export default function SidePanel() {
  const pathname = usePathname();
  const { user } = useUser();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) setIsMobileOpen(false);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      {/* MOBILE BUTTON */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-6 right-6 z-70 w-14 h-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center"
      >
        {isMobileOpen ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>

      {/* BACKDROP */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            onClick={() => setIsMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{
          width: isMobile ? 280 : isCollapsed ? 82 : 280,
          x: isMobile ? (isMobileOpen ? 0 : -300) : 0,
        }}
        transition={{
          type: "tween",
          ease: [0.22, 1, 0.36, 1],
          duration: 0.28,
        }}
        className={`h-screen bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm ${
          isMobile ? "fixed left-0 top-0" : "sticky top-0"
        }`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 relative">
          <Link href="/" className="flex items-center gap-3 h-14 overflow-hidden">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/images/auxillium-logo-3.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col"
                >
                  <h1 className="text-xl font-black tracking-tight uppercase">
                    Auxillium
                  </h1>
                  <span className="text-[10px] tracking-[0.3em] text-gray-400">
                    V1.0.4
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* DESKTOP TOGGLE */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-200 bg-white shadow-md items-center justify-center hover:bg-black hover:text-white transition"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`relative flex items-center gap-4  px-4 py-3 transition-colors ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0  bg-black -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}

                    <Icon className="w-5 h-5 shrink-0" />

                    <AnimatePresence mode="popLayout">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs font-bold tracking-wider whitespace-nowrap"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`w-full rounded-xl p-2 hover:bg-gray-100 flex items-center gap-3 transition ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-gray-500" />
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-left overflow-hidden"
                >
                  <p className="text-xs font-bold truncate uppercase">
                    {user?.name || user?.username || "Admin"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {user?.email || "admin@auxillium.com"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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