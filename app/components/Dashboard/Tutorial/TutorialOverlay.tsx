"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FolderKanban,
  UserRound,
  FileText,
  Wallet,
  TrendingUp,
  CheckSquare,
  Users,
} from "lucide-react";
import { useTutorial } from "@/app/context/TutorialContext";
import { useTranslation } from "@/app/context/TranslationContext";

const TOTAL_STEPS = 7;

interface StepConfig {
  key: string;
  icon: React.ReactNode;
  href: string;
  stepTitle: string;
  stepDesc: string;
}

const STEP_CONFIGS: StepConfig[] = [
  {
    key: "project",
    icon: <FolderKanban className="w-3.5 h-3.5" />,
    href: "/dashboard/projects/new",
    stepTitle: "Nazwij swój pierwszy projekt",
    stepDesc: "Wpisz nazwę projektu i krótki opis. Projekt to centrum Twojej pracy.",
  },
  {
    key: "client",
    icon: <UserRound className="w-3.5 h-3.5" />,
    href: "/dashboard/clients/new",
    stepTitle: "Dodaj firmę lub klienta",
    stepDesc: "Zapisz dane klienta — imię, email, telefon. Będziesz go powiązywać z projektami.",
  },
  {
    key: "document",
    icon: <FileText className="w-3.5 h-3.5" />,
    href: "/dashboard/templates",
    stepTitle: "Stwórz szablon dokumentu",
    stepDesc: "Zaprojektuj szablon faktury, oferty lub umowy. Użyjesz go do generowania PDF.",
  },
  {
    key: "costs",
    icon: <Wallet className="w-3.5 h-3.5" />,
    href: "/dashboard/costs-expenses",
    stepTitle: "Dodaj przychód lub wydatek",
    stepDesc: "Kliknij + i wpisz kwotę transakcji. Tak śledzisz finanse swojej firmy.",
  },
  {
    key: "lead",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    href: "/dashboard/leads/new",
    stepTitle: "Dodaj potencjalnego klienta",
    stepDesc: "Lead to osoba lub firma, z którą chcesz podjąć współpracę. Wpisz jej dane.",
  },
  {
    key: "task",
    icon: <CheckSquare className="w-3.5 h-3.5" />,
    href: "/dashboard/tasks",
    stepTitle: "Utwórz zadanie w tablicy",
    stepDesc: "Kliknij + żeby dodać zadanie. Tablica Kanban pomaga organizować pracę zespołu.",
  },
  {
    key: "employee",
    icon: <Users className="w-3.5 h-3.5" />,
    href: "/dashboard/space/employees",
    stepTitle: "Dodaj osobę z zespołu",
    stepDesc: "Zarejestruj pracownika lub współpracownika, żeby przydzielać mu zadania.",
  },
];

export default function TutorialOverlay({ locale }: { locale: string }) {
  const { currentStep, completedSteps, dismissed, isLoading, refresh, dismiss } = useTutorial();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    if (currentStep >= TOTAL_STEPS && !dismissed) {
      setShowCompleted(true);
      setCollapsed(false);
    }
  }, [currentStep, dismissed]);

  if (isLoading || dismissed) return null;
  if (currentStep >= TOTAL_STEPS && !showCompleted) return null;

  // Check if user is currently on the active step's page — spotlight handles it there
  const activeStepConfig = currentStep < TOTAL_STEPS ? STEP_CONFIGS[currentStep] : null;
  const isOnStepPage =
    activeStepConfig &&
    pathname.includes(activeStepConfig.href.replace(/^\//, ""));

  if (isOnStepPage) return null; // TutorialSpotlight takes over on the step's page

  const completedCount = completedSteps.filter(Boolean).length;
  const progressPct = Math.round((completedCount / TOTAL_STEPS) * 100);

  const handleDismiss = async () => {
    await dismiss();
  };

  const handleClose = async () => {
    setShowCompleted(false);
    await dismiss();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      <AnimatePresence mode="wait">
        {/* Completion state */}
        {showCompleted ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.15 }}
            className="w-[280px] bg-[#FAFAFA] border border-[#0A0A0A]"
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-10 h-10 bg-[#0A0A0A] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#FAFAFA]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-[0.2em] mb-1">
                  {t("tutorial:completed_title", "Gotowe!")}
                </p>
                <p className="text-[12px] text-[#71717A] leading-relaxed">
                  {t("tutorial:completed_desc", "Opanowałeś wszystkie podstawy Auxillium.")}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2 bg-[#0A0A0A] text-[#FAFAFA] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#2a2a2a] transition-colors"
              >
                {t("tutorial:close", "Zamknij")}
              </button>
            </div>
          </motion.div>
        ) : collapsed ? (
          /* Collapsed pill */
          <motion.button
            key="pill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-3 bg-[#FAFAFA] border border-[#0A0A0A] px-4 py-2.5 hover:bg-[#F4F4F5] transition-colors group"
          >
            {/* Linear progress */}
            <div className="w-16 h-[2px] bg-[#D4D4D8] overflow-hidden">
              <div
                className="h-full bg-[#0A0A0A] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em] leading-none">
                Pierwsze kroki
              </p>
              <p className="text-[9px] text-[#71717A] leading-none mt-0.5">
                {completedCount}/{TOTAL_STEPS} ukończone
              </p>
            </div>
            <ChevronUp className="w-3 h-3 text-[#A1A1AA] group-hover:text-[#0A0A0A] transition-colors" />
          </motion.button>
        ) : (
          /* Expanded panel */
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="w-[300px] bg-[#FAFAFA] border border-[#0A0A0A]"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#D4D4D8]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[9px] font-bold text-[#71717A] uppercase tracking-[0.3em] leading-none">
                    Auxillium
                  </p>
                  <h3 className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-tight leading-none mt-0.5">
                    Pierwsze kroki
                  </h3>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-6 h-6 flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[2px] bg-[#D4D4D8]">
                  <div
                    className="h-full bg-[#0A0A0A] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-[#71717A] tabular-nums">
                  {completedCount}/{TOTAL_STEPS}
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="py-1">
              {STEP_CONFIGS.map((step, idx) => {
                const isCompleted = completedSteps[idx] ?? false;
                const isActive = idx === currentStep;
                const isLocked = idx > currentStep;

                return (
                  <StepRow
                    key={step.key}
                    idx={idx}
                    step={step}
                    isCompleted={isCompleted}
                    isActive={isActive}
                    isLocked={isLocked}
                    locale={locale}
                  />
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#D4D4D8]">
              <button
                onClick={handleDismiss}
                className="text-[10px] font-bold text-[#A1A1AA] hover:text-[#0A0A0A] uppercase tracking-[0.15em] transition-colors"
              >
                Pomiń tutorial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StepRowProps {
  idx: number;
  step: StepConfig;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  locale: string;
}

function StepRow({ idx, step, isCompleted, isActive, isLocked, locale }: StepRowProps) {
  const href = `/${locale}${step.href}`;

  const rowContent = (
    <div
      className={`
        flex items-center gap-3 px-4 py-2.5
        ${isActive ? "bg-[#0A0A0A]" : ""}
        ${isLocked ? "opacity-30" : ""}
        ${!isActive && !isLocked ? "hover:bg-[#F4F4F5]" : ""}
        transition-colors cursor-pointer
      `}
    >
      {/* Status icon */}
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
        ) : isLocked ? (
          <Lock className="w-3 h-3 text-[#A1A1AA]" />
        ) : isActive ? (
          <div className="w-4 h-4 border border-[#FAFAFA] flex items-center justify-center">
            <span className="text-[7px] font-black text-[#FAFAFA]">{idx + 1}</span>
          </div>
        ) : (
          <div className="w-4 h-4 border border-[#D4D4D8] flex items-center justify-center">
            <span className="text-[7px] font-black text-[#A1A1AA]">{idx + 1}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <p
        className={`flex-1 text-[11px] font-bold leading-none ${
          isCompleted
            ? "text-[#A1A1AA] line-through"
            : isActive
            ? "text-[#FAFAFA]"
            : "text-[#0A0A0A]"
        }`}
      >
        {step.stepTitle}
      </p>

      {/* Arrow for active */}
      {isActive && (
        <ArrowRight className="w-3.5 h-3.5 text-[#FAFAFA] flex-shrink-0" />
      )}
    </div>
  );

  if (isActive) {
    return <Link href={href}>{rowContent}</Link>;
  }

  return rowContent;
}
