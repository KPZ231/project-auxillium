"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/app/context/TranslationContext";
import { sendVerificationCode } from "@/actions/verify-email";

interface Props {
  emailVerified: boolean;
}

export default function EmailVerificationBanner({ emailVerified }: Props) {
  const [sending, setSending] = useState(false);
  const { language } = useTranslation();

  if (emailVerified) return null;

  async function handleResend() {
    setSending(true);
    try {
      const result = await sendVerificationCode();
      if (result.success) {
        toast.success("Kod wysłany", {
          description: "Sprawdź swoją skrzynkę mailową.",
        });
      } else {
        toast.error("Nie udało się wysłać kodu", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full bg-[#0A0A0A] text-[#FAFAFA] px-6 py-3 flex items-center justify-center gap-6 print:hidden">
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
        Twoje konto nie jest zweryfikowane
      </span>
      <button
        onClick={handleResend}
        disabled={sending}
        className="text-[10px] font-bold tracking-[0.15em] uppercase border border-[#FAFAFA] border-opacity-40 px-3 py-1 hover:border-opacity-100 transition-all disabled:opacity-30"
      >
        {sending ? "Wysyłanie..." : "Wyślij ponownie"}
      </button>
      <Link
        href={`/${language}/verify-email`}
        className="text-[10px] font-bold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
      >
        Zweryfikuj →
      </Link>
    </div>
  );
}
