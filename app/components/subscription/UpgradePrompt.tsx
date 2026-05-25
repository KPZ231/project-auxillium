"use client";

import React from "react";
import Link from "next/link";
import LockIcon from "@mui/icons-material/Lock";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: "PRO" | "ENTERPRISE";
  currentPlan: "FREE" | "PRO" | "ENTERPRISE";
  locale?: string;
}

export default function UpgradePrompt({
  feature,
  requiredPlan,
  currentPlan,
  locale = "pl",
}: UpgradePromptProps) {
  const pricingHref = `/${locale}/pricing`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] py-12 px-6 text-center">
      {/* Lock icon */}
      <div className="w-16 h-16 border border-gray-200 flex items-center justify-center mb-6">
        <LockIcon sx={{ fontSize: 28, color: "#000" }} />
      </div>

      {/* Current plan badge */}
      <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.25em] uppercase border border-gray-300 text-gray-500 mb-4">
        {currentPlan} PLAN
      </span>

      {/* Feature name */}
      <h2 className="text-xl font-black tracking-tight uppercase mb-2">
        {feature}
      </h2>

      {/* Message */}
      <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-8">
        This feature requires{" "}
        <span className="text-black">{requiredPlan}</span> plan
      </p>

      {/* CTA button */}
      <Link
        href={pricingHref}
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors"
      >
        Upgrade to {requiredPlan}
      </Link>
    </div>
  );
}
