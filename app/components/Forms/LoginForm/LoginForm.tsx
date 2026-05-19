'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight, FaApple, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginFormData, loginSchema } from "@/lib/validators";
import { loginAction } from "@/actions/login";
import { useTranslation } from "@/app/context/TranslationContext";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
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

    try {
      const result = await loginAction(data);
      setLoading(false);

      if (result.success) {
        toast.success(t("forms:success.login_success"), {
          description: t("forms:success.redirecting"), // Note: I might need to add this key or use a fallback
        });
        reset();
        // Redirect to callbackUrl or dashboard
        router.push(callbackUrl);
      } else {
        toast.error(t("common:messages.error"), {
          description:
            result.error || t("forms:labels.login_failed", { defaultValue: "Nie udało się zalogować. Spróbuj ponownie." }),
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
    <section className="w-full min-h-screen px-6 py-12 md:py-20 flex flex-col items-center mt-16 md:mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--primary) tracking-tight uppercase">
            {t("forms:labels.login_title", { defaultValue: "Logowanie" })}
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            {t("forms:labels.login_subtitle", { defaultValue: "Witaj ponownie w systemie Auxillium." })}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          className="w-full flex flex-col gap-8 mt-4"
        >
          {/* Email/Username Field */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
              {t("forms:form.email_or_login")}
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder={t("forms:placeholders.email_or_login")}
              className={`w-full py-4 border-b ${errors.username ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.username && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
                {t("forms:form.password")}
              </label>
              <Link 
                href={`/${language}/forgot-password`} 
                className="text-[10px] font-bold text-(--neutral) uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                {t("forms:labels.forgot_password")}
              </Link>
            </div>
            <input
              {...register("password")}
              type="password"
              placeholder={t("forms:placeholders.password")}
              className={`w-full py-4 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.password && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {t(`forms:errors.${errors.password.message}` as `forms:errors.${string}`, { defaultValue: errors.password.message })}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30 mt-4"
          >
            {loading ? t("forms:labels.logging_in", { defaultValue: "Logowanie..." }) : (
              <>
                {t("forms:labels.login_button", { defaultValue: "Zaloguj się" })} <FaArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 opacity-30">
          <div className="flex-1 h-px bg-(--neutral)"></div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
            {t("forms:labels.or_continue_with")}
          </span>
          <div className="flex-1 h-px bg-(--neutral)"></div>
        </div>

        {/* Social Buttons */}
        <div className="w-full flex flex-col gap-3">
          {[
            { icon: <FcGoogle className="w-5 h-5" />, name: "Google", url: "/api/auth/login/google" },
            { icon: <FaGithub className="w-5 h-5" />, name: "GitHub", url: "/api/auth/login/github" },
          ].map((social) => (
            <button
              key={social.name}
              type="button"
              onClick={() => {
                if (social.url !== "#") {
                  window.location.href = social.url;
                }
              }}
              className="w-full py-4 border border-(--tertiary) flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider hover:bg-(--neutral) hover:text-(--secondary) transition-all group"
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{social.icon}</span>
              {social.name}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm tracking-tight">
          <span className="opacity-60">{t("forms:labels.no_account")} </span>
          <Link href={`/${language}/register`} className="font-bold hover:underline">
            {t("forms:buttons.sign_up", { ns: "common" })}
          </Link>
        </div>
      </div>
    </section>
  );
}
