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

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || "/dashboard";

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
        toast.success(`Zalogowano pomyślnie`, {
          description: "Przekierowywanie do panelu użytkownika.",
        });
        reset();
        // Redirect to callbackUrl or dashboard
        router.push(callbackUrl);
      } else {

        toast.error("Wystąpił błąd", {
          description:
            result.error || "Nie udało się zalogować. Spróbuj ponownie.",
        });
      }
    } catch {
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
            Logowanie
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            Witaj ponownie w systemie Auxillium.
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
              Adres e-mail lub login
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="Wprowadź e-mail lub login"
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
                Hasło
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-bold text-(--neutral) uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                Zapomniałeś hasła?
              </Link>
            </div>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`w-full py-4 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none transition-colors text-sm tracking-wide bg-transparent`}
            />
            {errors.password && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30 mt-4"
          >
            {loading ? "Logowanie..." : (
              <>
                Zaloguj się <FaArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 opacity-30">
          <div className="flex-1 h-px bg-(--neutral)"></div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
            lub kontynuuj przez
          </span>
          <div className="flex-1 h-px bg-(--neutral)"></div>
        </div>

        {/* Social Buttons */}
        <div className="w-full flex flex-col gap-3">
          {[
            { icon: <FcGoogle className="w-5 h-5" />, name: "Google" },
            { icon: <FaApple className="w-5 h-5" />, name: "Apple" },
            { icon: <FaGithub className="w-5 h-5" />, name: "GitHub" },
          ].map((social) => (
            <button
              key={social.name}
              type="button"
              className="w-full py-4 border border-(--tertiary) flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider hover:bg-(--neutral) hover:text-(--secondary) transition-all group"
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{social.icon}</span>
              {social.name}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm tracking-tight">
          <span className="opacity-60">Nie masz konta? </span>
          <Link href="/register" className="font-bold hover:underline">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </section>
  );
}
