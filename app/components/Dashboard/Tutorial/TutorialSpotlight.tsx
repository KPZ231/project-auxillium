"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { useTutorial } from "@/app/context/TutorialContext";

const TOTAL_STEPS = 7;

interface StepSpotlightConfig {
  pathMatch: string;
  stepIndex: number;
  heading: string;
  instruction: string;
  targetSelector: string; // CSS selector for the element to spotlight
  calloutPosition: "above" | "below";
}

// Each step: which URL, which DOM element to highlight, what to say
const SPOTLIGHT_CONFIGS: StepSpotlightConfig[] = [
  {
    pathMatch: "/dashboard/projects/new",
    stepIndex: 0,
    heading: "Krok 1: Nazwij swój projekt",
    instruction:
      "Wpisz nazwę projektu w pole poniżej. Może to być np. 'Strona dla kawiarni' lub 'Aplikacja mobilna'. Potem kliknij Utwórz projekt.",
    targetSelector: "[data-tutorial='project-form']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/clients/new",
    stepIndex: 1,
    heading: "Krok 2: Dodaj klienta",
    instruction:
      "Wpisz imię i nazwisko lub nazwę firmy klienta. Email i telefon są opcjonalne — możesz dodać je później.",
    targetSelector: "[data-tutorial='client-form']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/templates",
    stepIndex: 2,
    heading: "Krok 3: Stwórz szablon dokumentu",
    instruction:
      "Kliknij przycisk + lub 'Nowy szablon' żeby stworzyć szablon faktury, oferty lub umowy.",
    targetSelector: "[data-tutorial='templates-action']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/costs-expenses",
    stepIndex: 3,
    heading: "Krok 4: Wpisz transakcję",
    instruction:
      "Kliknij przycisk 'Dodaj transakcję' lub '+'. Wpisz kwotę i wybierz czy to wydatek czy przychód.",
    targetSelector: "[data-tutorial='finance-action']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/leads/new",
    stepIndex: 4,
    heading: "Krok 5: Dodaj potencjalnego klienta",
    instruction:
      "Wpisz nazwę leada — może to być imię osoby lub nazwa firmy, z którą chcesz nawiązać współpracę.",
    targetSelector: "[data-tutorial='lead-form']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/tasks",
    stepIndex: 5,
    heading: "Krok 6: Utwórz pierwsze zadanie",
    instruction:
      "Kliknij przycisk + żeby dodać nowe zadanie. Możesz przypisać je do projektu i ustalić termin.",
    targetSelector: "[data-tutorial='tasks-action']",
    calloutPosition: "above",
  },
  {
    pathMatch: "/dashboard/space/employees",
    stepIndex: 6,
    heading: "Krok 7: Dodaj osobę z zespołu",
    instruction:
      "Kliknij 'Dodaj pracownika' i wpisz imię oraz rolę. Będziesz mógł przydzielać tej osobie zadania i projekty.",
    targetSelector: "[data-tutorial='employees-action']",
    calloutPosition: "above",
  },
];

export default function TutorialSpotlight() {
  const { currentStep, dismissed, isLoading, refresh } = useTutorial();
  const pathname = usePathname();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  const config = SPOTLIGHT_CONFIGS.find(
    (c) => c.stepIndex === currentStep && pathname.includes(c.pathMatch)
  );

  useEffect(() => {
    if (!config) {
      setVisible(false);
      return;
    }

    setWindowWidth(window.innerWidth);

    const findTarget = () => {
      const el = document.querySelector(config.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        setVisible(true);
      } else {
        setTimeout(findTarget, 200);
      }
    };

    findTarget();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const el = document.querySelector(config.targetSelector);
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [config, pathname]);

  // Re-check on route change
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  if (isLoading || dismissed || currentStep >= TOTAL_STEPS) return null;
  if (!config || !visible || !targetRect) return null;

  const PADDING = 12;
  const CALLOUT_W = 320;
  const CALLOUT_GAP = 8;

  const spotX = targetRect.left - PADDING;
  const spotY = targetRect.top - PADDING;
  const spotW = targetRect.width + PADDING * 2;
  const spotH = targetRect.height + PADDING * 2;

  // Clamp left so card never overflows right edge
  const safeLeft =
    windowWidth > 0
      ? Math.max(8, Math.min(spotX, windowWidth - CALLOUT_W - 8))
      : Math.max(8, spotX);

  // Prefer above; fall back to below if not enough room above the fold
  const showBelow = spotY < 160;
  const calloutTop = showBelow
    ? spotY + spotH + CALLOUT_GAP
    : spotY - CALLOUT_GAP;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dark strips — create spotlight cutout */}
          {/* Top strip */}
          <motion.div
            key="dim-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-30"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, spotY),
              backgroundColor: "rgba(10,10,10,0.35)",
            }}
          />
          {/* Bottom strip */}
          <motion.div
            key="dim-bottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-30"
            style={{
              top: spotY + spotH,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(10,10,10,0.35)",
            }}
          />
          {/* Left strip */}
          <motion.div
            key="dim-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-30"
            style={{
              top: spotY,
              left: 0,
              width: Math.max(0, spotX),
              height: spotH,
              backgroundColor: "rgba(10,10,10,0.35)",
            }}
          />
          {/* Right strip */}
          <motion.div
            key="dim-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-30"
            style={{
              top: spotY,
              left: spotX + spotW,
              right: 0,
              height: spotH,
              backgroundColor: "rgba(10,10,10,0.35)",
            }}
          />

          {/* Spotlight border ring */}
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none z-31"
            style={{
              top: spotY,
              left: spotX,
              width: spotW,
              height: spotH,
              border: "2px solid #0A0A0A",
            }}
          />

          {/* Callout card */}
          <motion.div
            key="callout"
            initial={{ opacity: 0, y: showBelow ? -8 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, delay: 0.1 }}
            className="fixed z-40 bg-[#FAFAFA] border border-[#0A0A0A] max-w-[calc(100vw-16px)]"
            style={{
              width: CALLOUT_W,
              left: safeLeft,
              top: showBelow ? calloutTop : "auto",
              bottom: showBelow ? "auto" : `calc(100vh - ${calloutTop}px)`,
            }}
          >
            {/* Step indicator strip */}
            <div className="h-[3px] bg-[#0A0A0A] w-full" />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-[12px] font-bold text-[#0A0A0A] uppercase tracking-[0.1em] leading-tight">
                  {config.heading}
                </h4>
                <button
                  onClick={() => setVisible(false)}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[12px] text-[#71717A] leading-relaxed mb-4">
                {config.instruction}
              </p>

              {/* Step progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[2px] transition-all duration-300"
                    style={{
                      width: i === currentStep ? 16 : 6,
                      backgroundColor:
                        i < currentStep
                          ? "#16A34A"
                          : i === currentStep
                          ? "#0A0A0A"
                          : "#D4D4D8",
                    }}
                  />
                ))}
                <span className="ml-1 text-[9px] text-[#A1A1AA] font-bold uppercase tracking-[0.1em]">
                  {currentStep + 1}/{TOTAL_STEPS}
                </span>
              </div>
            </div>

            {/* Arrow pointing toward spotlight */}
            {!showBelow && (
              <div className="flex items-center gap-1 px-4 pb-3">
                <ArrowRight className="w-3 h-3 text-[#71717A] rotate-90" />
                <span className="text-[9px] text-[#A1A1AA] uppercase tracking-[0.1em]">
                  Wypełnij pole poniżej
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
