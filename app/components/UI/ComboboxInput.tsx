"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { OptionGroup } from "@/lib/predefined-data";

function normalizeOptions(options: OptionGroup[] | string[]): OptionGroup[] {
  if (options.length === 0) return [];
  if (typeof options[0] === "string") {
    return [{ group: "", options: options as string[] }];
  }
  return options as OptionGroup[];
}

interface ComboboxInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionGroup[] | string[];
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const ComboboxInput = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  helperText,
  tooltip,
  required,
  error,
  className = "",
}: ComboboxInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const normalized = normalizeOptions(options);

  const filteredGroups = normalized
    .map((g) => ({
      ...g,
      options: value
        ? g.options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
        : g.options,
    }))
    .filter((g) => g.options.length > 0);

  const quickPicks = normalized.flatMap((g) => g.options).slice(0, 5);

  const updateRect = useCallback(() => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 3, left: r.left, width: r.width });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen, updateRect]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-combobox-portal]")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const select = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const dropdown = (
    <AnimatePresence>
      {isOpen && filteredGroups.length > 0 && (
        <motion.div
          data-combobox-portal
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: dropdownRect.top,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
          className="bg-white border border-[#D4D4D8] shadow-2xl max-h-52 overflow-y-auto"
        >
          {filteredGroups.map((group, gi) => (
            <div key={gi}>
              {group.group && (
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#A1A1AA] bg-[#F8F8F8] border-b border-[#EBEBEB] sticky top-0">
                  {group.group}
                </div>
              )}
              {group.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors border-b border-[#F4F4F5] last:border-0 ${
                    value === opt
                      ? "bg-[#0A0A0A] text-white font-semibold"
                      : "text-[#0A0A0A] hover:bg-[#F4F4F5]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`space-y-2 w-full ${className}`} ref={containerRef}>
      {/* Label row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
            {label}
            {required && <span className="text-[#0A0A0A] ml-1">*</span>}
          </label>
          {tooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-[15px] h-[15px] rounded-full border border-[#B4B4BB] text-[#B4B4BB] text-[8px] font-black flex items-center justify-center hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors flex-shrink-0"
              >
                ?
              </button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 top-[calc(100%+8px)] z-[200] w-56 p-3 bg-[#0A0A0A] text-[#FAFAFA] text-[11px] leading-relaxed shadow-2xl pointer-events-none"
                  >
                    <div className="absolute -top-[5px] left-[5px] w-2.5 h-2.5 bg-[#0A0A0A] rotate-45" />
                    {tooltip}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        {error && (
          <span className="text-[10px] font-bold uppercase text-[#DC2626] tracking-tighter animate-pulse">
            {error}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full h-11 px-4 pr-9 bg-[#FAFAFA] border ${
            error
              ? "border-[#DC2626]"
              : isOpen
              ? "border-[#0A0A0A]"
              : "border-[#D4D4D8]"
          } rounded-none outline-none focus:ring-0 text-[14px] text-[#0A0A0A] transition-all duration-200 placeholder:text-[#A1A1AA] placeholder:italic`}
        />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </motion.div>
      </div>

      {/* Portal dropdown — rendered at document.body to escape overflow containers */}
      {mounted && createPortal(dropdown, document.body)}

      {/* Quick picks */}
      {!value && !isOpen && quickPicks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {quickPicks.map((pick) => (
            <button
              key={pick}
              type="button"
              onClick={() => onChange(pick)}
              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#71717A] border border-[#E5E5E5] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-150 whitespace-nowrap"
            >
              {pick}
            </button>
          ))}
          <span className="text-[9px] text-[#C4C4C7] italic self-center">or type your own</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-[11px] text-[#A1A1AA] italic leading-tight">{helperText}</p>
      )}
    </div>
  );
};
