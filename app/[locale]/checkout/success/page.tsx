"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Button from "@/app/components/Button/Button";
import { useTranslation } from "@/app/context/TranslationContext";

export default function CheckoutSuccessPage() {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--secondary) px-4">
      <div className="max-w-md w-full bg-white p-8 border border-(--primary) flex flex-col items-center text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mb-6" />
        <h1 className="text-3xl font-bold text-(--primary) mb-4 uppercase tracking-widest">
          Payment Successful
        </h1>
        <p className="text-(--neutral) mb-8">
          Thank you for your subscription! Your account has been upgraded.
        </p>
        <Button
          content="Return to Dashboard"
          variant="primary"
          url={`/${language}/dashboard`}
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}
