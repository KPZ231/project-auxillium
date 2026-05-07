"use client";

import React from "react";
import { motion } from "motion/react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PremiumInput = ({ label, error, helperText, className = "", ...props }: InputProps) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-end">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
          {label} {props.required && <span className="text-[#0A0A0A]">*</span>}
        </label>
        {error && (
          <span className="text-[10px] font-bold uppercase text-[#DC2626] tracking-tighter animate-pulse">
            {error}
          </span>
        )}
      </div>
      <motion.input
        whileFocus={{ backgroundColor: "#FFFFFF" }}
        className={`w-full h-11 px-4 bg-[#FAFAFA] border ${
          error ? "border-[#DC2626]" : "border-[#D4D4D8]"
        } rounded-none outline-none focus:border-[#0A0A0A] focus:ring-0 text-[14px] text-[#0A0A0A] transition-all duration-200 placeholder:text-[#A1A1AA] placeholder:italic ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-[#A1A1AA] italic leading-tight">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PremiumTextarea = ({ label, error, helperText, className = "", ...props }: TextareaProps) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-end">
        <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
          {label} {props.required && <span className="text-[#0A0A0A]">*</span>}
        </label>
        {error && (
          <span className="text-[10px] font-bold uppercase text-[#DC2626] tracking-tighter animate-pulse">
            {error}
          </span>
        )}
      </div>
      <motion.textarea
        whileFocus={{ backgroundColor: "#FFFFFF" }}
        className={`w-full p-4 bg-[#FAFAFA] border ${
          error ? "border-[#DC2626]" : "border-[#D4D4D8]"
        } rounded-none outline-none focus:border-[#0A0A0A] focus:ring-0 text-[14px] text-[#0A0A0A] transition-all duration-200 resize-none placeholder:text-[#A1A1AA] placeholder:italic ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-[#A1A1AA] italic leading-tight">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const PremiumSelect = ({ label, options, error, className = "", ...props }: SelectProps) => {
  return (
    <div className="space-y-2 w-full">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#71717A]">
        {label}
      </label>
      <div className="relative group">
        <select
          className={`w-full h-11 px-4 bg-[#FAFAFA] border ${
            error ? "border-[#DC2626]" : "border-[#D4D4D8]"
          } rounded-none outline-none focus:border-[#0A0A0A] focus:ring-0 text-[14px] text-[#0A0A0A] transition-all duration-200 appearance-none cursor-pointer group-hover:bg-[#F4F4F5] ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
