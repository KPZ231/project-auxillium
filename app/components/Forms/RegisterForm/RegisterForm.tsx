'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight, FaApple, FaGithub } from "react-icons/fa";
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
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

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
          description:
            result.error || t("forms:labels.registration_failed", { defaultValue: "Nie udało się zarejestrować. Spróbuj ponownie." }),
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
            {t("forms:labels.registration_title", { defaultValue: "Rejestracja" })}
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            {t("forms:labels.registration_subtitle", { defaultValue: "Witaj w systemie Auxillium." })}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          className="w-full flex flex-col gap-8 mt-4"
        >
          {/* Username Field */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
              {t("forms:form.username", { defaultValue: "Nazwa użytkownika" })} *
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder={t("forms:placeholders.username", { defaultValue: "jan_kowalski" })}
              className={`w-full py-4 border-b ${errors.username ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.username && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.username.message}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
              {t("forms:form.email", { defaultValue: "Adres e-mail" })} *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder={t("forms:placeholders.email", { defaultValue: "jan@przyklad.pl" })}
              className={`w-full py-4 border-b ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.email && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-[0.2em] text-(--neutral) uppercase opacity-60">
              {t("forms:form.password")} *
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder={t("forms:placeholders.password")}
              className={`w-full py-4 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder={t("forms:form.confirm_password")}
              className={`w-full py-4 border-b ${errors.confirmPassword ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.password && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.password.message}
              </span>
            )}
            {errors.confirmPassword && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30 mt-4"
          >
            {loading ? t("forms:labels.registering", { defaultValue: "Rejestracja..." }) : (
              <>
                {t("forms:buttons.sign_up", { ns: "common" })} <FaArrowRight className="w-4 h-4" />
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
          <span className="opacity-60">{t("forms:labels.have_account")} </span>
          <Link href={`/${language}/login`} className="font-bold hover:underline">
            {t("forms:buttons.log_in", { ns: "common" })}
          </Link>
        </div>
      </div>
    </section>
  );
}
