import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LeadJob {
  job_id: string;
  query: string;
  limit: number;
  status: "pending" | "running" | "done" | "error" | "not_found";
  progress: number;
  total: number;
  leads: number;
  log?: string[];
  results?: any[];
}

interface LeadSearchState {
  hasAcceptedGDPR: boolean;
  acceptGDPR: () => void;
  activeJobs: Record<string, LeadJob>;
  addJob: (job: LeadJob) => void;
  updateJob: (jobId: string, updates: Partial<LeadJob>) => void;
  removeJob: (jobId: string) => void;
}

export const useLeadSearchStore = create<LeadSearchState>()(
  persist(
    (set) => ({
      hasAcceptedGDPR: false,
      acceptGDPR: () => set({ hasAcceptedGDPR: true }),
      activeJobs: {},
      addJob: (job) =>
        set((state) => ({
          activeJobs: {
            ...state.activeJobs,
            [job.job_id]: job,
          },
        })),
      updateJob: (jobId, updates) =>
        set((state) => {
          const job = state.activeJobs[jobId];
          if (!job) return state;
          return {
            activeJobs: {
              ...state.activeJobs,
              [jobId]: { ...job, ...updates },
            },
          };
        }),
      removeJob: (jobId) =>
        set((state) => {
          const newJobs = { ...state.activeJobs };
          delete newJobs[jobId];
          return { activeJobs: newJobs };
        }),
    }),
    {
      name: "lead-search-storage",
      partialize: (state) => ({
        hasAcceptedGDPR: state.hasAcceptedGDPR,
        activeJobs: state.activeJobs, // Store active jobs so they persist across reloads
      }),
    }
  )
);
