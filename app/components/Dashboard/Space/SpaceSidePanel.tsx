"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  ArrowLeft,
} from "lucide-react";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

const spaceNavLinks: NavLink[] = [
  { name: "Dashboard", href: "/dashboard/space", icon: LayoutDashboard },
  { name: "Employees", href: "/dashboard/space/employees", icon: Users },
  { name: "Workload", href: "/dashboard/space/workload", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/space/settings", icon: Settings },
];

export default function SpaceSidePanel() {
  const pathname = usePathname();
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
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-6 right-6 z-70 w-14 h-14 rounded-none bg-black text-white flex items-center justify-center border border-white"
      >
        {isMobileOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* BACKDROP */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            onClick={() => setIsMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        animate={{
          width: isMobile ? 280 : isCollapsed ? 82 : 280,
          x: isMobile ? (isMobileOpen ? 0 : -300) : 0,
        }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
        className={`h-screen bg-white border-r border-slate-200 flex flex-col z-50 ${
          isMobile ? "fixed left-0 top-0" : "sticky top-0"
        }`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-200 relative">
          <Link href="/dashboard" className="flex items-center gap-3 h-14 overflow-hidden group">
            <div className="w-10 h-10 rounded-none bg-black flex items-center justify-center text-white shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-sm font-bold text-black leading-none uppercase tracking-tighter">Main Dashboard</h1>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.3em]">Exit Space</span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none border border-slate-200 bg-white items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-4 mb-4">
             {!isCollapsed && (
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] px-2">Management</p>
             )}
          </div>
          <ul className="space-y-0 px-0">
            {spaceNavLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/dashboard/space" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`relative flex items-center gap-4 px-6 py-4 transition-all duration-200 group ${
                      active
                        ? "bg-black text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    <AnimatePresence mode="popLayout">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap"
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

        {/* FOOTER - Current Space Info */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
           {!isCollapsed ? (
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-black/30 uppercase tracking-widest">Members</span>
                    <span className="text-sm font-black">{space._count?.members || 0}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-black/30 uppercase tracking-widest">Projects</span>
                    <span className="text-sm font-black">{space._count?.projects || 0}</span>
                 </div>
              </div>
           ) : (
              <div className="flex justify-center">
                 <Settings className="w-5 h-5 text-slate-400" />
              </div>
           )}
        </div>
      </motion.aside>
    </>
  );
}
