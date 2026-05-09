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
          description:
            result.error || t("forms:errors.reset_failed", { defaultValue: "Nie udało się zresetować hasła. Spróbuj ponownie." }),
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
    <section className="w-full min-h-screen px-6 py-20 flex flex-col items-center mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--primary) tracking-tight uppercase">
            {t("forms:labels.password_reset_title", { defaultValue: "Resetowanie hasła" })}
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            {t("forms:labels.password_reset_subtitle", { defaultValue: "Wpisz swój adres e-mail lub login aby zresetować hasło." })}
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
              {t("forms:form.email_or_login")} *
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder={t("forms:placeholders.email_or_login")}
              className={`w-full py-4 border-b ${errors.email ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.email && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30 mt-4"
          >
            {loading ? t("forms:labels.resetting", { defaultValue: "Resetowanie..." }) : (
              <>
                {t("forms:buttons.reset_password", { ns: "common", defaultValue: "Zresetuj hasło" })} <FaArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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
