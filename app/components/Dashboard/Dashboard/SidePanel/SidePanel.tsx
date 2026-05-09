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
  FileText,
  Settings,
} from "lucide-react";

import { useTranslation } from "@/app/context/TranslationContext";

interface NavLink {
  key: string;
  href: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { key: "dashboard.title", href: "/dashboard", icon: LayoutDashboard },
  { key: "project.projects", href: "/dashboard/projects", icon: FolderKanban },
  {
    key: "finance.title",
    href: "/dashboard/costs-expenses",
    icon: Receipt,
  },
  { key: "task.tasks", href: "/dashboard/tasks", icon: ClipboardList },
  { key: "lead.lead_search", href: "/dashboard/lead-search", icon: UserSearch },
  { key: "lead.leads", href: "/dashboard/leads", icon: Users },
  { key: "client.clients", href: "/dashboard/clients", icon: Contact2 },
  { key: "ai.chat", href: "/dashboard/ai", icon: MessageSquareCode },
  { key: "documents.title", href: "/dashboard/documents", icon: FileText },
];

export default function SidePanel() {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  
  // Helper to get path without locale for comparison and building localized links
  const getPathWithoutLocale = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0 && ["pl", "en", "de"].includes(segments[0])) {
      return "/" + segments.slice(1).join("/");
    }
    return path;
  };

  const currentPathWithoutLocale = getPathWithoutLocale(pathname);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
          <Link
            href="/"
            className="flex items-center gap-3 h-14 overflow-hidden"
          >
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
              const active = currentPathWithoutLocale === link.href;
              const Icon = link.icon;
              const localizedHref = `/${language}${link.href}`;

              return (
                <li key={link.href}>
                  <Link
                    href={localizedHref}
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
                          {t(`dashboard:${link.key}`)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="p-2 mb-4">
          <div className="border-t border-[var(--neutral, #e5e5e5)] pt-2">
            <Link
              href={`/${language}/dashboard/space/settings`}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`relative flex items-center gap-4 px-4 py-3 transition-colors ${
                currentPathWithoutLocale === "/dashboard/space/settings"
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <AnimatePresence mode="popLayout">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-bold tracking-wider whitespace-nowrap uppercase"
                  >
                    {t("dashboard:space.settings")}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </footer>
      </motion.aside>
    </>
  );
}
