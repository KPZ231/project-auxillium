"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/app/context/TranslationContext";
import { getReportData } from "@/actions/reporting";
import LoadingCircle from "@/app/components/UI/LoadingCircle";
import { Printer } from "lucide-react";

interface ReportClientProps {
  spaceId: string;
  locale: string;
}

export default function ReportClient({ spaceId, locale }: ReportClientProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const [dateRange, setDateRange] = useState("this-month");
  const [sections, setSections] = useState({
    metrics: true,
    projects: true,
    tasks: true,
    finances: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getReportData(spaceId, dateRange);
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, dateRange]);

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // formatting helpers
  const formatCurrency = (amount: number, currency: string = "PLN") => {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(locale);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 print:p-0 print:gap-0 print:max-w-none">
      
      {/* --- CONFIGURATION CARD (HIDDEN ON PRINT) --- */}
      <div className="bg-white border border-[#D4D4D8] p-6 md:p-8 flex flex-col gap-6 print:hidden shadow-none rounded-none">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight uppercase mb-2">
            {t("dashboard:metrics.report_generator_title", "Report Generator")}
          </h1>
          <p className="text-[#71717A] text-[16px] font-light">
            {t("dashboard:metrics.report_generator_subtitle", "Configure and generate a professional summary report.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#D4D4D8] pt-6">
          {/* Date Range */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wider">
              {t("dashboard:metrics.report_date_range", "Date Range")}
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { id: "this-month", label: t("dashboard:metrics.report_this_month", "This Month") },
                { id: "last-month", label: t("dashboard:metrics.report_last_month", "Last Month") },
                { id: "last-30-days", label: t("dashboard:metrics.report_last_30_days", "Last 30 Days") },
                { id: "this-year", label: t("dashboard:metrics.report_this_year", "This Year") },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border flex items-center justify-center rounded-none transition-colors ${dateRange === opt.id ? "bg-[#0A0A0A] border-[#0A0A0A]" : "bg-white border-[#D4D4D8] group-hover:border-[#A1A1AA]"}`}>
                    {dateRange === opt.id && <div className="w-2 h-2 bg-[#FAFAFA]" />}
                  </div>
                  <input
                    type="radio"
                    name="dateRange"
                    value={opt.id}
                    checked={dateRange === opt.id}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-[14px]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sections Toggle */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-semibold uppercase tracking-wider">
              {t("dashboard:metrics.report_toggle_sections", "Report Sections")}
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { id: "metrics", label: t("dashboard:metrics.report_sec_metrics", "Key Metrics") },
                { id: "projects", label: t("dashboard:metrics.report_sec_projects", "Projects") },
                { id: "tasks", label: t("dashboard:metrics.report_sec_tasks", "Active Tasks") },
                { id: "finances", label: t("dashboard:metrics.report_sec_finances", "Financial Details") },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-[18px] h-[18px] border flex items-center justify-center rounded-none transition-colors ${sections[opt.id as keyof typeof sections] ? "bg-[#0A0A0A] border-[#0A0A0A]" : "bg-white border-[#D4D4D8] group-hover:border-[#A1A1AA]"}`}>
                     {sections[opt.id as keyof typeof sections] && (
                        <svg className="w-3 h-3 text-[#FAFAFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                  </div>
                  <input
                    type="checkbox"
                    checked={sections[opt.id as keyof typeof sections]}
                    onChange={() => toggleSection(opt.id as keyof typeof sections)}
                    className="hidden"
                  />
                  <span className="text-[14px]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4D4D8] pt-6 flex justify-end">
          <button
            onClick={handlePrint}
            disabled={loading || !data}
            className="bg-[#0A0A0A] text-[#FAFAFA] border-none px-8 py-3 text-[14px] font-medium flex items-center gap-2 hover:bg-[#27272A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
          >
            <Printer className="w-4 h-4" />
            {t("dashboard:metrics.report_generate_btn", "Generate PDF")}
          </button>
        </div>
      </div>

      {/* --- PRINT PREVIEW AREA --- */}
      <div className="bg-white p-0 md:p-8 border-none md:border border-[#D4D4D8] print:border-none print:block print:p-0 min-h-[800px] flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center print:hidden">
            <LoadingCircle size="lg" />
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-12 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-[#0A0A0A] pb-6 mb-4">
              <div>
                <h1 className="text-[40px] font-bold leading-none mb-2 text-[#0A0A0A]">
                  {t("dashboard:metrics.report_title", "EXECUTIVE SUMMARY REPORT")}
                </h1>
                <p className="text-[20px] font-semibold text-[#0A0A0A]">
                  {data.space.name}
                </p>
              </div>
              <div className="text-right text-[13px] font-mono text-[#0A0A0A]">
                <p>{t("dashboard:metrics.report_header_generated_by", "Generated by")}: {data.user.name}</p>
                <p>{t("dashboard:metrics.report_header_date", "Date")}: {new Date().toLocaleDateString(locale)}</p>
                <p>Range: {formatDate(data.dateRange.from)} - {formatDate(data.dateRange.to)}</p>
              </div>
            </div>

            {/* Metrics Section */}
            {sections.metrics && (
              <section className="print:break-inside-avoid">
                <h2 className="text-[20px] font-bold uppercase border-b border-[#D4D4D8] pb-2 mb-4 text-[#0A0A0A]">
                  {t("dashboard:metrics.report_sec_metrics", "Key Metrics")}
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border border-[#0A0A0A] p-4">
                    <p className="text-[12px] uppercase tracking-widest text-[#71717A] mb-1">Total Expenses</p>
                    <p className="text-[24px] font-bold">
                      {formatCurrency(data.finances.expenses.reduce((sum: number, e: any) => sum + e.amount, 0))}
                    </p>
                  </div>
                  <div className="border border-[#0A0A0A] p-4">
                    <p className="text-[12px] uppercase tracking-widest text-[#71717A] mb-1">Total Income</p>
                    <p className="text-[24px] font-bold">
                      {formatCurrency(data.finances.incomes.reduce((sum: number, e: any) => sum + e.amount, 0))}
                    </p>
                  </div>
                  <div className="border border-[#0A0A0A] p-4">
                    <p className="text-[12px] uppercase tracking-widest text-[#71717A] mb-1">Active Projects</p>
                    <p className="text-[24px] font-bold">{data.projects.length}</p>
                  </div>
                  <div className="border border-[#0A0A0A] p-4">
                    <p className="text-[12px] uppercase tracking-widest text-[#71717A] mb-1">Pending Tasks</p>
                    <p className="text-[24px] font-bold">{data.tasks.length}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Projects Section */}
            {sections.projects && (
              <section className="print:break-inside-avoid">
                <h2 className="text-[20px] font-bold uppercase border-b border-[#D4D4D8] pb-2 mb-4 text-[#0A0A0A]">
                  {t("dashboard:metrics.report_sec_projects", "Projects")}
                </h2>
                {data.projects.length === 0 ? (
                  <p className="text-[14px] text-[#71717A] italic">{t("dashboard:metrics.report_no_data", "No data")}</p>
                ) : (
                  <table className="w-full text-left text-[13px] font-mono border-collapse border border-[#0A0A0A]">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#0A0A0A]">
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Project Name</th>
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Status</th>
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Budget</th>
                        <th className="p-3 uppercase tracking-wider font-bold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projects.map((p: any) => (
                        <tr key={p.id} className="border-b border-[#0A0A0A] last:border-b-0">
                          <td className="p-3 border-r border-[#0A0A0A]">{p.projectName}</td>
                          <td className="p-3 border-r border-[#0A0A0A]">{p.projectStatus}</td>
                          <td className="p-3 border-r border-[#0A0A0A]">{p.budget ? formatCurrency(p.budget) : "-"}</td>
                          <td className="p-3">{formatDate(p.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}

            {/* Tasks Section */}
            {sections.tasks && (
              <section className="print:break-inside-avoid">
                <h2 className="text-[20px] font-bold uppercase border-b border-[#D4D4D8] pb-2 mb-4 text-[#0A0A0A]">
                  {t("dashboard:metrics.report_sec_tasks", "Active Tasks")}
                </h2>
                 {data.tasks.length === 0 ? (
                  <p className="text-[14px] text-[#71717A] italic">{t("dashboard:metrics.report_no_data", "No data")}</p>
                ) : (
                  <table className="w-full text-left text-[13px] font-mono border-collapse border border-[#0A0A0A]">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#0A0A0A]">
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Task Title</th>
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Project</th>
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Assignee</th>
                        <th className="p-3 border-r border-[#0A0A0A] uppercase tracking-wider font-bold">Priority</th>
                        <th className="p-3 uppercase tracking-wider font-bold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tasks.map((t: any) => (
                        <tr key={t.id} className="border-b border-[#0A0A0A] last:border-b-0">
                          <td className="p-3 border-r border-[#0A0A0A]">{t.title}</td>
                          <td className="p-3 border-r border-[#0A0A0A]">{t.project?.projectName || "-"}</td>
                          <td className="p-3 border-r border-[#0A0A0A]">{t.employee?.name || "-"}</td>
                          <td className="p-3 border-r border-[#0A0A0A]">{t.priority}</td>
                          <td className="p-3">{formatDate(t.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}

            {/* Finances Section */}
            {sections.finances && (
              <section className="print:break-inside-avoid">
                <h2 className="text-[20px] font-bold uppercase border-b border-[#D4D4D8] pb-2 mb-4 text-[#0A0A0A]">
                  {t("dashboard:metrics.report_sec_finances", "Financial Details")}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                  {/* Expenses */}
                  <div>
                    <h3 className="text-[16px] font-bold mb-3 uppercase text-[#0A0A0A]">Expenses</h3>
                    {data.finances.expenses.length === 0 ? (
                      <p className="text-[14px] text-[#71717A] italic">No expenses in this period.</p>
                    ) : (
                      <table className="w-full text-left text-[12px] font-mono border-collapse border border-[#0A0A0A]">
                        <thead>
                          <tr className="bg-[#FAFAFA] border-b border-[#0A0A0A]">
                            <th className="p-2 border-r border-[#0A0A0A]">Date</th>
                            <th className="p-2 border-r border-[#0A0A0A]">Category</th>
                            <th className="p-2 border-r border-[#0A0A0A]">Desc</th>
                            <th className="p-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.finances.expenses.map((e: any) => (
                            <tr key={e.id} className="border-b border-[#0A0A0A] last:border-b-0">
                              <td className="p-2 border-r border-[#0A0A0A] whitespace-nowrap">{formatDate(e.date)}</td>
                              <td className="p-2 border-r border-[#0A0A0A] truncate max-w-[80px]">{e.category}</td>
                              <td className="p-2 border-r border-[#0A0A0A] truncate max-w-[100px]">{e.description}</td>
                              <td className="p-2 text-right text-[#DC2626] font-bold whitespace-nowrap">
                                -{formatCurrency(e.amount, e.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Incomes */}
                  <div>
                    <h3 className="text-[16px] font-bold mb-3 uppercase text-[#0A0A0A]">Incomes</h3>
                    {data.finances.incomes.length === 0 ? (
                      <p className="text-[14px] text-[#71717A] italic">No incomes in this period.</p>
                    ) : (
                      <table className="w-full text-left text-[12px] font-mono border-collapse border border-[#0A0A0A]">
                        <thead>
                          <tr className="bg-[#FAFAFA] border-b border-[#0A0A0A]">
                            <th className="p-2 border-r border-[#0A0A0A]">Date</th>
                            <th className="p-2 border-r border-[#0A0A0A]">Category</th>
                            <th className="p-2 border-r border-[#0A0A0A]">Desc</th>
                            <th className="p-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.finances.incomes.map((i: any) => (
                            <tr key={i.id} className="border-b border-[#0A0A0A] last:border-b-0">
                              <td className="p-2 border-r border-[#0A0A0A] whitespace-nowrap">{formatDate(i.date)}</td>
                              <td className="p-2 border-r border-[#0A0A0A] truncate max-w-[80px]">{i.category}</td>
                              <td className="p-2 border-r border-[#0A0A0A] truncate max-w-[100px]">{i.description}</td>
                              <td className="p-2 text-right text-[#16A34A] font-bold whitespace-nowrap">
                                +{formatCurrency(i.amount, i.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Footer */}
             <div className="mt-12 pt-4 border-t border-[#D4D4D8] text-center text-[10px] font-mono text-[#71717A] print:mt-auto">
                Confidential Report • {data.space.name} • Generated by Project Auxillium
             </div>

          </div>
        )}
      </div>

    </div>
  );
}
