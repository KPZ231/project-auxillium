'use client'

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { z } from "zod";
import { resetPassword } from "@/actions/reset-password";

const schema = z.object({
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordConfirm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  async function onSubmit(data: FormData) {
    if (!token) {
      toast.error("Błąd", { description: "Nieprawidłowy token resetowania." });
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, data.password);
      setLoading(false);

      if (result.success) {
        toast.success(`Hasło zostało zmienione!`, {
          description: "Możesz teraz zalogować się używając nowego hasła.",
        });
        router.push("/login");
      } else {
        toast.error("Wystąpił błąd", {
          description: result.error || "Nie udało się zmienić hasła.",
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Wystąpił błąd połączenia");
    }
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Błędny link</h1>
        <p className="opacity-60">Ten link do resetowania hasła jest nieprawidłowy lub wygasł.</p>
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen px-6 py-20 flex flex-col items-center mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col gap-12">
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-(--primary) uppercase">Nowe hasło</h1>
          <p className="text-sm text-(--neutral) opacity-60">Wprowadź nowe hasło dla swojego konta.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-widest uppercase opacity-60">Nowe hasło</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`w-full py-4 border-b ${errors.password ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none bg-transparent`}
            />
            {errors.password && <span className="text-[10px] text-red-500">{errors.password.message}</span>}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold tracking-widest uppercase opacity-60">Potwierdź hasło</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className={`w-full py-4 border-b ${errors.confirmPassword ? 'border-red-500' : 'border-(--tertiary)'} focus:border-(--primary) outline-none bg-transparent`}
            />
            {errors.confirmPassword && <span className="text-[10px] text-red-500">{errors.confirmPassword.message}</span>}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-(--primary) text-(--secondary) font-bold uppercase flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-30"
          >
            {loading ? "Zmiana..." : <>Zmień hasło <FaArrowRight /></>}
          </button>
        </form>
      </div>
    </section>
  );
}
