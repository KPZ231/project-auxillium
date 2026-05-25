"use client";

import { useTranslation } from "@/app/context/TranslationContext";

export function Translate({ tKey, values }: { tKey: string; values?: Record<string, any> }) {
  const { t } = useTranslation();
  return <>{t(tKey, values)}</>;
}
