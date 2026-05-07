"use client";

import React from "react";

interface MemberBadgeProps {
  name: string;
  role?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function MemberBadge({ 
  name, 
  role, 
  size = "md", 
  className = "", 
  onRemove,
  showRemove = false
}: MemberBadgeProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "h-6 text-[10px]",
    md: "h-8 text-[12px]",
    lg: "h-10 text-[14px]",
  };

  const avatarSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={`flex items-center gap-2 bg-[#F4F4F5] border border-[#E5E5E5] px-2 py-1 group ${className}`}>
      <div className={`${avatarSizeClasses[size]} bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center font-bold tracking-tight`}>
        {initials}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-[#0A0A0A] leading-tight">{name}</span>
        {role && <span className="text-[10px] text-[#71717A] uppercase tracking-wider">{role}</span>}
      </div>
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 text-[#71717A] hover:text-[#DC2626] transition-colors"
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
}
