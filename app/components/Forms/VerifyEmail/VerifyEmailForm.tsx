"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaArrowRight } from "react-icons/fa";
import { verifyEmailCode, sendVerificationCode } from "@/actions/verify-email";
import { useTranslation } from "@/app/context/TranslationContext";

export default function VerifyEmailForm() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitting = useRef(false);
  const router = useRouter();
  const { language } = useTranslation();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && digit) {
      handleSubmit(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    if (pasted.length === 6) {
      handleSubmit(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  async function handleSubmit(code: string) {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    try {
      const result = await verifyEmailCode(code);
      if (result.success) {
        toast.success("Email zweryfikowany!", {
          description: "Twoje konto jest teraz w pełni aktywne.",
        });
        router.refresh();
        router.push(`/${language}/dashboard`);
      } else {
        toast.error("Błąd weryfikacji", { description: result.error });
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const result = await sendVerificationCode();
      if (result.success) {
        toast.success("Nowy kod wysłany", {
          description: "Sprawdź swoją skrzynkę mailową.",
        });
      } else {
        toast.error("Nie udało się wysłać kodu", { description: result.error });
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
    } finally {
      setResending(false);
    }
  }

  const code = digits.join("");

  return (
    <section className="w-full min-h-screen px-6 py-20 flex flex-col items-center mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--primary) tracking-tight uppercase">
            Weryfikacja
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            Wpisz 6-cyfrowy kod wysłany na Twój adres e-mail.
          </p>
        </div>

        {/* 6-digit input */}
        <div className="flex gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={loading}
              className="w-12 h-14 text-center text-2xl font-bold border-b-2 border-(--tertiary) focus:border-(--primary) outline-none transition-colors bg-transparent disabled:opacity-30"
            />
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => handleSubmit(code)}
          disabled={loading || code.length < 6}
          className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          {loading ? "Weryfikowanie..." : (
            <>Zweryfikuj konto <FaArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Resend */}
        <div className="text-center text-sm tracking-tight">
          <span className="opacity-60">Nie otrzymałeś kodu? </span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-bold hover:underline disabled:opacity-30"
          >
            {resending ? "Wysyłanie..." : "Wyślij ponownie"}
          </button>
        </div>
      </div>
    </section>
  );
}
