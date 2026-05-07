"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, LayoutGrid, List } from "lucide-react";

interface LeadsFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SUGGESTIONS = [
  { id: 1, title: "John Doe", type: "Lead", status: "Qualified" },
  { id: 2, title: "Project Alpha", type: "Project", status: "Active" },
  { id: 3, title: "Marketing Campaign", type: "Task", status: "Negotiation" },
];

export default function LeadsFilter({
  selectedFilter,
  onFilterChange,
  view,
  onViewChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: LeadsFiltersProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filters = ["ALL ACTIVE", "QUALIFIED", "NEGOTIATION", "COLD"];

  return (
    <section className="w-full px-8 py-6 flex flex-row items-center justify-between border-b border-gray-200 bg-white">
      {/* Left: Filters */}
      <div className="flex flex-row gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-6 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border ${
              selectedFilter === filter
                ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                : "bg-transparent text-[#71717A] border-[#E5E5E5] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            } rounded-none`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Right: Sort, View, Search */}
      <div className="flex flex-row items-center gap-8">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs font-bold text-gray-800 bg-transparent cursor-pointer focus:outline-none"
          >
            <option value="Manual Order">Manual Order</option>
            <option value="Last Activity">Last Activity</option>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* View Switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onViewChange("grid")}
            className={`p-1 transition-colors ${
              view === "grid" ? "text-black" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`p-1 transition-colors ${
              view === "list" ? "text-black" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            <List size={20} />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`text-gray-400 hover:text-black transition-colors ${searchQuery ? "text-black" : ""}`}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Search Popup (Modal) */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-none overflow-hidden border border-[#0A0A0A]"
              >
                <div className="flex items-center px-8 py-6 border-b border-[#F4F4F5]">
                  <Search className="text-[#0A0A0A] mr-6" size={24} strokeWidth={1.5} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 text-[18px] outline-none bg-transparent placeholder:text-[#D4D4D8] font-light text-[#0A0A0A]"
                  />
                  <button
                    onClick={() => {
                      onSearchChange("");
                      setIsSearchOpen(false);
                    }}
                    className="text-[10px] px-2 py-1 border border-[#E5E5E5] font-bold text-[#71717A] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-all rounded-none uppercase tracking-widest"
                  >
                    ESC
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {!searchQuery ? (
                    <div className="p-8">
                      <h3 className="text-[11px] font-bold text-[#71717A] uppercase tracking-[0.2em] mb-6">
                        Quick Suggestions
                      </h3>
                      <div className="space-y-3">
                        {SUGGESTIONS.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-none hover:bg-[#F4F4F5] cursor-pointer transition-all border border-transparent hover:border-[#E5E5E5]"
                            onClick={() => {
                              onSearchChange(item.title);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-none bg-[#0A0A0A] flex items-center justify-center text-[13px] font-bold text-white uppercase">
                                {item.title[0]}
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[#0A0A0A] uppercase tracking-tight">{item.title}</p>
                                <p className="text-[10px] text-[#71717A] uppercase tracking-widest">{item.type}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-3 py-1 bg-[#FAFAFA] border border-[#E5E5E5] text-[#71717A] uppercase tracking-wider">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-gray-500">
                        Searching for <span className="font-bold text-black">"{searchQuery}"</span>...
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">
                        Press Enter to see all results
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-8 py-4 bg-[#FAFAFA] border-t border-[#F4F4F5] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded-none bg-white border border-[#D4D4D8] text-[10px] font-bold shadow-sm text-[#0A0A0A]">
                        ↵
                      </kbd>
                      <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">Select</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded-none bg-white border border-[#D4D4D8] text-[10px] font-bold shadow-sm text-[#0A0A0A]">
                        ↑↓
                      </kbd>
                      <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">Navigate</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#D4D4D8] uppercase tracking-[0.3em] font-black">Auxilium Engine</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
