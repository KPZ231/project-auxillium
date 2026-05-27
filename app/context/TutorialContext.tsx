"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTutorialStatus, dismissTutorial } from "@/actions/tutorial";
import type { TutorialStatus } from "@/actions/tutorial";

interface TutorialContextType {
  currentStep: number;
  completedSteps: boolean[];
  dismissed: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  dismiss: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<TutorialStatus>({
    currentStep: 0,
    completedSteps: Array(7).fill(false),
    dismissed: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await getTutorialStatus();
      setStatus(result);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismiss = useCallback(async () => {
    await dismissTutorial();
    setStatus((prev) => ({ ...prev, dismissed: true }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <TutorialContext.Provider
      value={{
        currentStep: status.currentStep,
        completedSteps: status.completedSteps,
        dismissed: status.dismissed,
        isLoading,
        refresh,
        dismiss,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
}
