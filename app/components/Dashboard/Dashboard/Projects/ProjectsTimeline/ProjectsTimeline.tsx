"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import { getProjects, forceRefreshProjects } from "@/actions/getProjects";
import { Project } from "@/lib/generated/client/client";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProjectsTimeline() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data as any);
      } else {
        toast.error("Failed to load projects");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while loading projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Create an array for the grid cells
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // empty cells before the first day
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Find projects for a specific day
  const getProjectsForDay = (day: number | null) => {
    if (day === null) return [];
    
    return projects.filter(p => {
      if (!p.dueDate) return false;
      const d = new Date(p.dueDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[14px] text-[#71717A]">Loading calendar...</p>
      </div>
    );
  }

  return (
    <section className="w-full py-6 px-4">
      <motion.div 
        className="bg-white border border-[#E5E5E5] p-6 shadow-sm"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-[#0A0A0A] uppercase">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 border border-[#D4D4D8] hover:border-[#0A0A0A] transition-colors bg-[#FAFAFA]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[12px] font-bold tracking-wider uppercase border border-[#D4D4D8] hover:border-[#0A0A0A] transition-colors bg-[#FAFAFA]">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 border border-[#D4D4D8] hover:border-[#0A0A0A] transition-colors bg-[#FAFAFA]">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="bg-[#FAFAFA] p-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
              {day}
            </div>
          ))}

          {days.map((day, idx) => {
            const dayProjects = getProjectsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div 
                key={idx} 
                className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-[#FAFAFA] ${
                  isToday ? 'bg-blue-50/30' : ''
                }`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[14px] font-bold ${isToday ? 'text-blue-600' : 'text-[#0A0A0A]'}`}>
                        {day}
                      </span>
                      {dayProjects.length > 0 && (
                        <span className="text-[10px] font-medium bg-[#0A0A0A] text-white px-1.5 py-0.5 rounded-full">
                          {dayProjects.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                      {dayProjects.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                          className="text-[11px] font-medium px-2 py-1 bg-[#F4F4F5] border-l-2 border-[#0A0A0A] cursor-pointer hover:bg-[#E5E5E5] truncate transition-colors"
                          title={p.projectName}
                        >
                          {p.projectName}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
