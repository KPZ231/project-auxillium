'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FaArrowRight, FaApple, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/actions/reset-password";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);

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
        toast.success(`Resetowanie hasła pomyślne!`, {
          description: result.message || "Sprawdź swoją skrzynkę mailową aby kontynuować proces.",
        });
        reset();
      } else {
        toast.error("Błąd resetowania hasła", {
          description:
            result.error || "Nie udało się zresetować hasła. Spróbuj ponownie.",
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Wystąpił błąd połączenia", {
        description: "Sprawdź swoje połączenie internetowe i spróbuj ponownie.",
      });
    }
  }

  const onValidationError = () => {
    toast.error("Błąd walidacji", {
      description: "Proszę poprawić błędy w polach formularza",
    });
  };

  return (
    <section className="w-full min-h-screen px-6 py-20 flex flex-col items-center mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--primary) tracking-tight uppercase">
            Resetowanie hasła
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            Wpisz swój adres e-mail lub login aby zresetować hasło.
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
              Adres e-mail lub login *
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder="Wprowadź e-mail lub login"
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
            {loading ? "Resetowanie hasła..." : (
              <>
                Zresetuj hasło <FaArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm tracking-tight">
          <span className="opacity-60">Masz już konto? </span>
          <Link href="/login" className="font-bold hover:underline">
            Zaloguj się
          </Link>
        </div>
      </div>
    </section>
  );
}
