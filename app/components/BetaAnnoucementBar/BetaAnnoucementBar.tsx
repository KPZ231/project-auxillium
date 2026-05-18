"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useTranslation } from "@/app/context/TranslationContext";

export default function BetaAnnoucementBar() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed in localStorage
    const dismissed = localStorage.getItem("beta-announcement-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("beta-announcement-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#0A0A0A] text-[#FAFAFA] py-2.5 px-4 flex items-center justify-between text-xs tracking-wider font-mono border-b border-zinc-850 z-9999 relative">
      <div className="flex-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
        <span className="inline-flex items-center bg-zinc-800 text-[#FAFAFA] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-700">
          BETA
        </span>
        <span className="text-zinc-300 font-light">
          {t("common:beta_announcement.message")}
        </span>
        <a
          href="https://github.com/KPZ231/project-auxillium/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FAFAFA] font-bold underline hover:text-zinc-350 transition-colors duration-150 inline-flex items-center gap-1"
        >
          {t("common:beta_announcement.link_text")}
          <span className="no-underline">→</span>
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className="text-zinc-400 hover:text-[#FAFAFA] transition-colors duration-150 p-1 -mr-1 cursor-pointer focus:outline-none"
        aria-label="Dismiss announcement"
      >
        <MdClose className="w-4 h-4" />
      </button>
    </div>
  );
}
