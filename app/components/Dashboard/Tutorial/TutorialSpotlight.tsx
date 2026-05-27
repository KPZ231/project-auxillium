"use client";

import React, { useEffect, useId, useState } from "react";
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
  targetSelector: string;
  calloutPosition: "above" | "below";
}

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

const PADDING = 12;
const CALLOUT_W = 320;
const CALLOUT_GAP = 12;

export default function TutorialSpotlight() {
  const { currentStep, dismissed, isLoading, refresh } = useTutorial();
  const pathname = usePathname();
  const maskId = useId().replace(/:/g, "");
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);

  const config = SPOTLIGHT_CONFIGS.find(
    (c) => c.stepIndex === currentStep && pathname.includes(c.pathMatch)
  );

  useEffect(() => {
    if (!config) {
      setVisible(false);
      return;
    }

    const updateViewport = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });

    updateViewport();

    const findTarget = () => {
      const el = document.querySelector(config.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        setVisible(true);
      } else {
        setTimeout(findTarget, 200);
      }
    };

    findTarget();

    const onResize = () => {
      updateViewport();
      const el = document.querySelector(config.targetSelector);
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [config, pathname]);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  if (isLoading || dismissed || currentStep >= TOTAL_STEPS) return null;
  if (!config || !visible || !targetRect) return null;

  const { w: vw, h: vh } = viewport;

  const spotX = Math.max(0, targetRect.left - PADDING);
  const spotY = Math.max(0, targetRect.top - PADDING);
  const spotW = targetRect.width + PADDING * 2;
  const spotH = targetRect.height + PADDING * 2;

  // Clamp callout so it never overflows either edge
  const calloutWidth = Math.min(CALLOUT_W, vw - 16);
  const safeLeft =
    vw > 0 ? Math.max(8, Math.min(spotX, vw - calloutWidth - 8)) : 8;

  // Position callout above unless not enough room
  const showBelow = spotY < 180;
  const calloutTop = showBelow ? spotY + spotH + CALLOUT_GAP : spotY - CALLOUT_GAP;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Full-window SVG overlay with spotlight hole */}
          <motion.svg
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9998, width: "100dvw", height: "100dvh" }}
            viewBox={`0 0 ${vw || 1} ${vh || 1}`}
            preserveAspectRatio="none"
          >
            <defs>
              <mask id={maskId}>
                {/* White = show overlay; black = transparent (spotlight hole) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={spotX}
                  y={spotY}
                  width={spotW}
                  height={spotH}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(10,10,10,0.55)"
              mask={`url(#${maskId})`}
            />
          </motion.svg>

          {/* Spotlight border ring */}
          <motion.div
            key="ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed pointer-events-none"
            style={{
              zIndex: 9999,
              top: spotY,
              left: spotX,
              width: spotW,
              height: spotH,
              border: "2px solid #0A0A0A",
              boxShadow: "0 0 0 1px rgba(250,250,250,0.4)",
            }}
          />

          {/* Callout card */}
          <motion.div
            key="callout"
            initial={{ opacity: 0, y: showBelow ? -8 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.12 }}
            className="fixed bg-[#FAFAFA] border border-[#0A0A0A]"
            style={{
              zIndex: 10000,
              width: calloutWidth,
              left: safeLeft,
              ...(showBelow
                ? { top: calloutTop }
                : { bottom: `calc(100dvh - ${calloutTop}px)` }),
            }}
          >
            {/* Step indicator strip */}
            <div className="h-[3px] bg-[#0A0A0A] w-full" />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-[0.1em] leading-tight">
                  {config.heading}
                </h4>
                <button
                  onClick={() => setVisible(false)}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[12px] text-[#71717A] leading-relaxed mb-4">
                {config.instruction}
              </p>

              {/* Step progress */}
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

            {/* Arrow hint */}
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
