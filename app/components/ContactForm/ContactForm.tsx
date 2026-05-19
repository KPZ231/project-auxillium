"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, Variants } from "motion/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validators";
import { useTranslation } from "@/app/context/TranslationContext";


export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  async function onSubmit(data: ContactFormData) {
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success(t("forms:success.message_sent"), {
          description: t("forms:success.contact_thanks", { defaultValue: "Dziękujemy za kontakt. Odpowiemy tak szybko, jak to możliwe." }),
        });
        reset();
      } else {
        toast.error(t("common:messages.error"), {
          description: result.error || t("forms:errors.contact_failed", { defaultValue: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." }),
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error(t("common:messages.network_error"), {
        description: t("common:messages.please_try_again"),
      });
    }
  }

  const onValidationError = () => {
    toast.error(t("forms:labels.validation_error"), {
      description: t("forms:labels.validation_error_desc"),
    });
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <section className="w-full px-6 lg:px-12 py-20 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32"
      >
        {/* Left Side: Form */}
        <div className="flex flex-col gap-12">
          <motion.h2
            variants={itemVariants}
            custom={0}
            className="text-3xl lg:text-4xl font-bold tracking-tight text-(--primary) uppercase"
          >
            {t("forms:contact_title", { defaultValue: "Wyślij zapytanie" })}
          </motion.h2>

          <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="flex flex-col gap-8">
            <input type="text" {...register("website")} className="hidden" />

            <motion.div
              variants={itemVariants}
              custom={1}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                  {t("forms:form.full_name")}
                </label>
                {errors.name && (
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <input
                {...register("name")}
                type="text"
                placeholder={t("forms:placeholders.full_name")}
                className={`w-full p-4 border ${errors.name ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors uppercase text-sm tracking-wide`}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={2}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                  {t("forms:form.email")}
                </label>
                {errors.email && (
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder={t("forms:placeholders.email")}
                className={`w-full p-4 border ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors uppercase text-sm tracking-wide`}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={3}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                  {t("forms:form.message")}
                </label>
                {errors.message && (
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                    {errors.message.message}
                  </span>
                )}
              </div>
              <textarea
                {...register("message")}
                rows={6}
                placeholder={t("forms:placeholders.description")}
                className={`w-full p-4 border ${errors.message ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors uppercase text-sm tracking-wide resize-none`}
              />
            </motion.div>

            <motion.button
              variants={itemVariants}
              custom={4}
              disabled={loading}
              type="submit"
              className="w-fit px-12 py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer"
            >
              {loading ? t("forms:labels.registering") : t("forms:buttons.submit", { defaultValue: "Wyślij wiadomość" })}
            </motion.button>
          </form>
        </div>

        {/* Right Side: Info */}
        <div className="flex flex-col gap-16 pt-2">
          <div className="flex flex-col sm:flex-row gap-8 justify-between">
            <motion.div
              variants={itemVariants}
              custom={5}
              className="flex flex-col gap-4"
            >
              <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                {t("forms:labels.phone", { defaultValue: "Zadzwoń" })}
              </label>
              <p className="text-xl font-bold tracking-tight text-(--primary)">
                <Link href={"tel:" + process.env.NEXT_PUBLIC_PHONE}>
                  +48 501 740 587
                </Link>
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              custom={6}
              className="flex flex-col gap-4"
            >
              <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                {t("forms:labels.email", { defaultValue: "Napisz" })}
              </label>
              <p className="text-xl font-bold tracking-tight text-(--primary)">
                <Link href={"mailto:" + process.env.NEXT_PUBLIC_EMAIL}>
                  {process.env.NEXT_PUBLIC_EMAIL}
                </Link>
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
            <motion.label
              variants={itemVariants}
              custom={7}
              className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60"
            >
              {t("forms:labels.available", { defaultValue: "Dostępność" })}
            </motion.label>
            <div className="flex flex-col border-t border-(--tertiary)">
              {[
                { day: t("forms:days.mon_fri", { defaultValue: "PON - PT" }), time: "09:00 - 17:00" },
                { day: t("forms:days.sat", { defaultValue: "SOBOTA" }), time: t("forms:days.closed", { defaultValue: "ZAMKNIĘTE" }) },
                { day: t("forms:days.sun", { defaultValue: "NIEDZIELA" }), time: t("forms:days.closed", { defaultValue: "ZAMKNIĘTE" }) },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  custom={8 + i}
                  className="flex justify-between py-4 border-b border-(--tertiary) items-center"
                >
                  <span className="text-xs font-bold tracking-wider text-(--primary)">
                    {item.day}
                  </span>
                  <span className="text-xs font-medium tracking-wider text-(--neutral)">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
