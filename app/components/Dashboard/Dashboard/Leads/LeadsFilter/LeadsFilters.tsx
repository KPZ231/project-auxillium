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
            className={`px-6 py-2 text-xs font-bold tracking-widest transition-all duration-200 ${
              selectedFilter === filter
                ? "bg-black text-white"
                : "bg-transparent text-gray-400 border border-gray-200 hover:border-gray-400"
            }`}
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
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100"
              >
                <div className="flex items-center px-6 py-4 border-b border-gray-100">
                  <Search className="text-gray-400 mr-4" size={20} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-300"
                  />
                  <button
                    onClick={() => {
                      onSearchChange("");
                      setIsSearchOpen(false);
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    ESC
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {!searchQuery ? (
                    <div className="p-6">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Suggested Results
                      </h3>
                      <div className="space-y-2">
                        {SUGGESTIONS.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                            onClick={() => {
                              onSearchChange(item.title);
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                {item.title[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                <p className="text-[10px] text-gray-400">{item.type}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">
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

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold shadow-sm">
                        ↵
                      </kbd>
                      <span className="text-[10px] text-gray-400 font-medium">to select</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold shadow-sm">
                        ↑↓
                      </kbd>
                      <span className="text-[10px] text-gray-400 font-medium">to navigate</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-300 italic">Project Auxillium Search</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
