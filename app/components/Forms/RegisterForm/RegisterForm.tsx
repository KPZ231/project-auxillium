'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RegisterFormData, registerSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/register";
import { useTranslation } from "@/app/context/TranslationContext";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, language } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const termsAccepted = watch("acceptTerms");

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      const result = await registerAction(data);
      setLoading(false);
      if (result.success) {
        toast.success(t("forms:success.registration_success"), {
          description: t("forms:success.redirecting_dashboard", { defaultValue: "Przekierowywanie do panelu użytkownika." }),
        });
        reset();
        router.push(`/${language}/dashboard`);
      } else {
        toast.error(t("common:messages.error"), {
          description: result.error || t("forms:labels.registration_failed", { defaultValue: "Nie udało się zarejestrować. Spróbuj ponownie." }),
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
            01
          </span>
          <div className="w-8 h-px bg-[#FAFAFA] opacity-15" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl lg:text-[2.25rem] font-bold uppercase tracking-[0.12em] text-[#FAFAFA] leading-none">
              {t("forms:labels.registration_title", { defaultValue: "Rejestracja" })}
            </h2>
            <p className="text-[13px] text-[#FAFAFA] opacity-35 leading-relaxed max-w-[220px]">
              {t("forms:labels.registration_subtitle", { defaultValue: "Witaj w systemie Auxillium." })}
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
              {t("forms:labels.registration_title", { defaultValue: "Rejestracja" })}
            </h1>
            <p className="text-sm text-(--neutral) opacity-50 tracking-tight">
              {t("forms:labels.registration_subtitle", { defaultValue: "Witaj w systemie Auxillium." })}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="flex flex-col gap-6">

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                {t("forms:form.username", { defaultValue: "Nazwa użytkownika" })} *
              </label>
              <input
                {...register("username")}
                type="text"
                placeholder={t("forms:placeholders.username", { defaultValue: "jan_kowalski" })}
                className={`w-full py-3.5 border-b ${errors.username ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
              />
              {errors.username && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {errors.username.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                {t("forms:form.email", { defaultValue: "Adres e-mail" })} *
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder={t("forms:placeholders.email", { defaultValue: "jan@przyklad.pl" })}
                className={`w-full py-3.5 border-b ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
              />
              {errors.email && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                {t("forms:form.password")} *
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder={t("forms:placeholders.password")}
                className={`w-full py-3.5 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
              />
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder={t("forms:form.confirm_password")}
                className={`w-full py-3.5 border-b ${errors.confirmPassword ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25 mt-1`}
              />
              {errors.password && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {errors.password.message}
                </span>
              )}
              {errors.confirmPassword && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-start gap-3.5 cursor-pointer group">
                <input
                  {...register("acceptTerms")}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className={`relative flex-shrink-0 mt-0.5 w-[17px] h-[17px] border transition-all duration-150 ${termsAccepted ? "border-[#0A0A0A] bg-[#0A0A0A]" : "border-(--tertiary)"}`}>
                  <svg
                    className={`absolute inset-0 m-auto w-2.5 h-2.5 text-[#FAFAFA] transition-transform duration-150 ${termsAccepted ? "scale-100" : "scale-0"}`}
                    viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"
                  >
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </div>
                <span className="text-[11px] leading-relaxed tracking-wide text-(--neutral) opacity-45 group-hover:opacity-65 transition-opacity select-none">
                  Akceptuję{" "}
                  <Link href={`/${language}/terms`} className="font-bold underline underline-offset-2 decoration-dotted" onClick={(e) => e.stopPropagation()}>
                    Regulamin
                  </Link>{" "}
                  oraz{" "}
                  <Link href={`/${language}/privacy`} className="font-bold underline underline-offset-2 decoration-dotted" onClick={(e) => e.stopPropagation()}>
                    Politykę Prywatności
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider pl-8">
                  {errors.acceptTerms.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-(--primary) text-(--secondary) font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:opacity-85 transition-opacity duration-200 disabled:opacity-30 mt-2"
            >
              {loading ? t("forms:labels.registering", { defaultValue: "Rejestracja..." }) : (
                <>
                  {t("forms:buttons.sign_up", { ns: "common" })}
                  <FaArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-(--tertiary)" />
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-(--neutral) opacity-35 whitespace-nowrap">
              {t("forms:labels.or_continue_with")}
            </span>
            <div className="flex-1 h-px bg-(--tertiary)" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            {[
              { icon: <FcGoogle className="w-4 h-4" />, name: "Google", url: "/api/auth/login/google" },
              { icon: <FaGithub className="w-4 h-4" />, name: "GitHub", url: "/api/auth/login/github" },
            ].map((social) => (
              <button
                key={social.name}
                type="button"
                onClick={() => { if (social.url !== "#") window.location.href = social.url; }}
                className="flex-1 py-3.5 border border-(--tertiary) flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-(--primary) hover:text-(--secondary) hover:border-(--primary) transition-all duration-200 group"
              >
                <span className="opacity-55 group-hover:opacity-100 transition-opacity">{social.icon}</span>
                {social.name}
              </button>
            ))}
          </div>

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
