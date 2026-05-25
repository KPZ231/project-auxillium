"use client";
import { useTranslation } from "@/app/context/TranslationContext";

export default function TermsPage() {
  const { t } = useTranslation();
  const count = parseInt(t("marketing:terms.sections_count") || "0", 10);
  const sections = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <section className="w-full px-6 lg:px-12 pt-6 mt-36">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-20">
        <h1 className="text-4xl lg:text-6xl font-bold text-(--primary)">
          {t("marketing:terms.title")}
        </h1>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          {t("marketing:terms.description")}
        </p>
        <p className="text-sm font-medium text-(--neutral) opacity-60">
          {t("marketing:terms.publication_date")}
        </p>

        {sections.map((n) => (
          <section key={n} className="flex flex-col gap-2">
            <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
              {t(`marketing:terms.section${n}.title`)}
            </h2>
            <p className="text-lg lg:text-xl font-medium text-(--neutral)">
              {t(`marketing:terms.section${n}.content`)}
            </p>
          </section>
        ))}
      </div>
    </section>
  );
}
