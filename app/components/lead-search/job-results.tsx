"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLeadSearchStore, LeadJob } from "@/store/leadSearchStore";
import { getLeadSearchJob, deleteLeadSearchJob } from "@/actions/leadSearch";
import { toast } from "sonner";
import { Download, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE = "https://scraper-bdxt.onrender.com";

function JobCard({ job }: { job: LeadJob }) {
  const { t } = useTranslation("dashboard");
  const updateJob = useLeadSearchStore((state) => state.updateJob);
  const removeJob = useLeadSearchStore((state) => state.removeJob);

  // Polling logic for running/pending jobs
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (job.status === "pending" || job.status === "running") {
      interval = setInterval(async () => {
        const res = await getLeadSearchJob(job.job_id);
        if (res.success && res.data) {
          updateJob(job.job_id, res.data);
        } else if (res.error === "not_found") {
          updateJob(job.job_id, { status: "error" });
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [job.status, job.job_id, updateJob]);

  const handleDelete = async () => {
    const res = await deleteLeadSearchJob(job.job_id);
    if (res.success) {
      removeJob(job.job_id);
      toast.success("Job deleted");
    } else {
      toast.error(res.error || "Failed to delete job");
    }
  };

  const isRunning = job.status === "pending" || job.status === "running";
  const isDone = job.status === "done";
  const isError = job.status === "error" || job.status === "not_found";

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 hover:border-[#0A0A0A] transition-colors relative group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-[20px] text-[#0A0A0A] mb-1">
            {job.query}
          </h3>
          <p className="font-mono text-[13px] text-[#71717A]">ID: {job.job_id}</p>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <span className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-[#71717A]">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("lead_search_ui.scanning")}
            </span>
          )}
          {isDone && (
            <span className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-[#16A34A]">
              <CheckCircle className="w-4 h-4" />
              {t("status.done")}
            </span>
          )}
          {isError && (
            <span className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-[#DC2626]">
              <AlertCircle className="w-4 h-4" />
              Error
            </span>
          )}
          <button
            onClick={handleDelete}
            className="text-[#D4D4D8] hover:text-[#DC2626] transition-colors ml-4"
            title={t("lead_search_ui.delete_job")}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-[12px] text-[#71717A] uppercase tracking-wide mb-1">
            {t("lead_search_ui.progress")}
          </div>
          <div className="text-[16px] text-[#0A0A0A] font-light">
            {job.progress} / {job.total || job.limit}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-[#71717A] uppercase tracking-wide mb-1">
            {t("lead_search_ui.leads_found")}
          </div>
          <div className="text-[16px] text-[#0A0A0A] font-light">
            {job.leads}
          </div>
        </div>
      </div>

      {isDone && (
        <a
          href={`${API_BASE}/api/jobs/${job.job_id}/csv`}
          download
          className="inline-flex items-center justify-center gap-2 h-[40px] px-6 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-[14px] transition-colors hover:bg-[#0A0A0A] hover:text-[#FAFAFA]"
        >
          <Download className="w-4 h-4" />
          {t("lead_search_ui.download_csv")}
        </a>
      )}
    </div>
  );
}

export default function JobResults() {
  const { t } = useTranslation("dashboard");
  const activeJobs = useLeadSearchStore((state) => state.activeJobs);
  const jobs = Object.values(activeJobs).reverse(); // Newest first

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 border-t border-[#E5E5E5]">
        <p className="text-[16px] font-light text-[#71717A]">
          {t("lead_search_ui.no_jobs")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-[28px] text-[#0A0A0A] mb-8">
        {t("lead_search_ui.results_title")}
      </h2>
      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <JobCard key={job.job_id} job={job} />
        ))}
      </div>
    </div>
  );
}
