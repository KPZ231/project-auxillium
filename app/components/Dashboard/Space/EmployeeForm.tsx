"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { addEmployee } from "@/actions/employee";
import { toast } from "sonner";
import { useTranslation } from "@/app/context/TranslationContext";

const employeeSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Employee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  createdAt: string | Date;
  _count?: {
    assignedProjects: number;
    assignedTasks: number;
  };
}

interface EmployeeFormProps {
  onClose: () => void;
  onSuccess: (employee: Employee) => void;
}

export default function EmployeeForm({ onClose, onSuccess }: EmployeeFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await addEmployee(data);
      if (result.success) {
        toast.success(t("dashboard:employees.added_success"));
        onSuccess(result.employee);
      } else {
        toast.error(t("dashboard:employees.add_failed"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/90 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-white border border-black p-10 z-10"
      >
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">{t("dashboard:employees.add_title")}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">{t("dashboard:employees.breadcrumb")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">{t("dashboard:employees.full_name")}</label>
              <input
                {...register("name")}
                className="w-full px-0 py-3 bg-transparent border-b border-slate-200 focus:border-black rounded-none text-sm font-bold placeholder:text-slate-200 outline-none transition-all"
                placeholder={t("dashboard:employees.full_name")}
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">{t("dashboard:employees.position")}</label>
              <input
                {...register("role")}
                className="w-full px-0 py-3 bg-transparent border-b border-slate-200 focus:border-black rounded-none text-sm font-bold placeholder:text-slate-200 outline-none transition-all"
                placeholder={t("dashboard:employees.position")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">{t("dashboard:employees.email_address")}</label>
            <input
              {...register("email")}
              className="w-full px-0 py-3 bg-transparent border-b border-slate-200 focus:border-black rounded-none text-sm font-bold placeholder:text-slate-200 outline-none transition-all"
              placeholder={t("dashboard:employees.email_address")}
            />
            {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">{t("dashboard:employees.phone_number")}</label>
            <input
              {...register("phone")}
              className="w-full px-0 py-3 bg-transparent border-b border-slate-200 focus:border-black rounded-none text-sm font-bold placeholder:text-slate-200 outline-none transition-all"
              placeholder={t("dashboard:employees.phone_number")}
            />
          </div>

          <div className="pt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-black text-black rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
            >
              {t("dashboard:employees.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-none font-bold text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("dashboard:employees.saving")}
                </>
              ) : (
                t("dashboard:employees.save")
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
