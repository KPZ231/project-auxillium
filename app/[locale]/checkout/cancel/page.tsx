"use client";

import { XCircle } from "lucide-react";
import Button from "@/app/components/Button/Button";
import { useTranslation } from "@/app/context/TranslationContext";

export default function CheckoutCancelPage() {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--secondary) px-4">
      <div className="max-w-md w-full bg-white p-8 border border-(--primary) flex flex-col items-center text-center">
        <XCircle className="w-16 h-16 text-red-600 mb-6" />
        <h1 className="text-3xl font-bold text-(--primary) mb-4 uppercase tracking-widest">
          {t("common:checkout.cancel_title")}
        </h1>
        <p className="text-(--neutral) mb-8">
          {t("common:checkout.cancel_desc")}
        </p>
        <Button
          content={t("common:checkout.return_pricing")}
          variant="primary"
          url={`/${language}`}
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}
