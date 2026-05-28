'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/actions/reset-password";
import { useTranslation } from "@/app/context/TranslationContext";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setLoading(true);
    try {
      const result = await requestPasswordReset(data);
      setLoading(false);
      if (result.success) {
        toast.success(t("forms:success.password_reset_email_sent"), {
          description: result.message || t("forms:messages.check_email", { defaultValue: "Sprawdź swoją skrzynkę mailową aby kontynuować proces." }),
        });
        reset();
      } else {
        toast.error(t("forms:messages.error", { ns: "common" }), {
          description: result.error || t("forms:errors.reset_failed", { defaultValue: "Nie udało się zresetować hasła. Spróbuj ponownie." }),
        });
      }
    } catch {
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

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <aside className="hidden md:flex flex-col justify-between w-[340px] lg:w-[400px] shrink-0 bg-[#0A0A0A] pt-24 lg:pt-28 pb-12 lg:pb-14 px-12 lg:px-14">
        <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#FAFAFA] opacity-25">
          Auxillium
        </span>

        <div className="flex flex-col gap-5">
          <span className="font-mono text-[9rem] leading-none font-bold text-[#FAFAFA] opacity-[0.06] tracking-tighter select-none -ml-1">
            03
          </span>
          <div className="w-8 h-px bg-[#FAFAFA] opacity-15" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl lg:text-[2.25rem] font-bold uppercase tracking-[0.12em] text-[#FAFAFA] leading-none">
              {t("forms:labels.password_reset_title", { defaultValue: "Reset hasła" })}
            </h2>
            <p className="text-[13px] text-[#FAFAFA] opacity-35 leading-relaxed max-w-[220px]">
              {t("forms:labels.password_reset_subtitle", { defaultValue: "Wpisz swój adres e-mail lub login aby zresetować hasło." })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#FAFAFA] opacity-10" />
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#FAFAFA] opacity-15">
            2025
          </span>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-16 pt-24 md:pt-28">
        <div className="w-full max-w-[420px] flex flex-col gap-9">

          {/* Mobile header */}
          <div className="md:hidden flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-(--primary) tracking-[0.08em] uppercase">
              {t("forms:labels.password_reset_title", { defaultValue: "Reset hasła" })}
            </h1>
            <p className="text-sm text-(--neutral) opacity-50 tracking-tight">
              {t("forms:labels.password_reset_subtitle", { defaultValue: "Wpisz swój adres e-mail lub login aby zresetować hasło." })}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="flex flex-col gap-6">

            {/* Email / username field */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                {t("forms:form.email_or_login")} *
              </label>
              <input
                {...register("email")}
                type="text"
                placeholder={t("forms:placeholders.email_or_login")}
                className={`w-full py-3.5 border-b ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
              />
              {errors.email && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-(--primary) text-(--secondary) font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:opacity-85 transition-opacity duration-200 disabled:opacity-30 mt-2"
            >
              {loading ? t("forms:labels.resetting", { defaultValue: "Resetowanie..." }) : (
                <>
                  {t("forms:buttons.reset_password", { ns: "common", defaultValue: "Zresetuj hasło" })}
                  <FaArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center text-[11px] pt-2 border-t border-(--tertiary)">
            <span className="opacity-40 tracking-wide">{t("forms:labels.have_account")} </span>
            <Link href={`/${language}/login`} className="font-bold tracking-wide opacity-70 hover:opacity-100 transition-opacity hover:underline">
              {t("forms:buttons.log_in", { ns: "common" })}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
