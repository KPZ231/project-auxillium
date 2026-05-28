'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginFormData, loginSchema } from "@/lib/validators";
import { loginAction } from "@/actions/login";
import { useTranslation } from "@/app/context/TranslationContext";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const callbackUrl = searchParams.get('callbackUrl') || `/${language}/dashboard`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    const payload: LoginFormData =
      loginMethod === "email"
        ? { email: data.email, password: data.password }
        : { username: data.username, password: data.password };

    try {
      const result = await loginAction(payload);
      setLoading(false);
      if (result.success) {
        toast.success(t("forms:success.login_success"), {
          description: t("forms:success.redirecting"),
        });
        reset();
        router.push(callbackUrl);
      } else {
        toast.error(t("common:messages.error"), {
          description: result.error || t("forms:labels.login_failed", { defaultValue: "Nie udało się zalogować. Spróbuj ponownie." }),
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
            02
          </span>
          <div className="w-8 h-px bg-[#FAFAFA] opacity-15" />
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl lg:text-[2.25rem] font-bold uppercase tracking-[0.12em] text-[#FAFAFA] leading-none">
              {t("forms:labels.login_title", { defaultValue: "Logowanie" })}
            </h2>
            <p className="text-[13px] text-[#FAFAFA] opacity-35 leading-relaxed max-w-[220px]">
              {t("forms:labels.login_subtitle", { defaultValue: "Witaj ponownie w systemie Auxillium." })}
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
              {t("forms:labels.login_title", { defaultValue: "Logowanie" })}
            </h1>
            <p className="text-sm text-(--neutral) opacity-50 tracking-tight">
              {t("forms:labels.login_subtitle", { defaultValue: "Witaj ponownie w systemie Auxillium." })}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="flex flex-col gap-6">

            {/* Method toggle */}
            <div className="flex border border-(--tertiary)">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2.5 text-[9px] font-bold tracking-[0.25em] uppercase transition-colors duration-150 ${
                  loginMethod === "email"
                    ? "bg-[#0A0A0A] text-[#FAFAFA]"
                    : "text-(--neutral) opacity-40 hover:opacity-70"
                }`}
              >
                {t("forms:labels.login_by_email", { defaultValue: "E-mail" })}
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("username")}
                className={`flex-1 py-2.5 text-[9px] font-bold tracking-[0.25em] uppercase transition-colors duration-150 ${
                  loginMethod === "username"
                    ? "bg-[#0A0A0A] text-[#FAFAFA]"
                    : "text-(--neutral) opacity-40 hover:opacity-70"
                }`}
              >
                {t("forms:labels.login_by_username", { defaultValue: "Nazwa użytkownika" })}
              </button>
            </div>

            {/* Email field */}
            {loginMethod === "email" && (
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                  {t("forms:form.email")}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder={t("forms:placeholders.email", { defaultValue: "adres@email.com" })}
                  className={`w-full py-3.5 border-b ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
                />
                {errors.email && (
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                    {t(`forms:errors.${errors.email.message}` as `forms:errors.${string}`, { defaultValue: errors.email.message })}
                  </span>
                )}
              </div>
            )}

            {/* Username field */}
            {loginMethod === "username" && (
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                  {t("forms:form.username")}
                </label>
                <input
                  {...register("username")}
                  type="text"
                  placeholder={t("forms:placeholders.username", { defaultValue: "nazwa_użytkownika" })}
                  className={`w-full py-3.5 border-b ${errors.username ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
                />
                {errors.username && (
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                    {t(`forms:errors.${errors.username.message}` as `forms:errors.${string}`, { defaultValue: errors.username.message })}
                  </span>
                )}
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="text-[9px] font-bold tracking-[0.28em] text-(--neutral) uppercase opacity-45">
                  {t("forms:form.password")}
                </label>
                <Link
                  href={`/${language}/forgot-password`}
                  className="text-[9px] font-bold text-(--neutral) uppercase tracking-[0.18em] opacity-35 hover:opacity-70 transition-opacity"
                >
                  {t("forms:labels.forgot_password")}
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder={t("forms:placeholders.password")}
                className={`w-full py-3.5 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors duration-200 text-sm tracking-wide bg-transparent placeholder:opacity-25`}
              />
              {errors.password && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  {t(`forms:errors.${errors.password.message}` as `forms:errors.${string}`, { defaultValue: errors.password.message })}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-(--primary) text-(--secondary) font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:opacity-85 transition-opacity duration-200 disabled:opacity-30 mt-2"
            >
              {loading ? t("forms:labels.logging_in", { defaultValue: "Logowanie..." }) : (
                <>
                  {t("forms:labels.login_button", { defaultValue: "Zaloguj się" })}
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
            <span className="opacity-40 tracking-wide">{t("forms:labels.no_account")} </span>
            <Link href={`/${language}/register`} className="font-bold tracking-wide opacity-70 hover:opacity-100 transition-opacity hover:underline">
              {t("forms:buttons.sign_up", { ns: "common" })}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
