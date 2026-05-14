"use client";
import { useTranslation } from "@/app/context/TranslationContext";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <section className="w-full px-6 lg:px-12 pt-6 mt-36">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl lg:text-6xl font-bold text-(--primary)">
          {t("marketing:privacy.title")}
        </h1>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          {t("marketing:privacy.description")} {process.env.NEXT_PUBLIC_WEBSITE_NAME}
        </p>
        <p className="text-lg lg:text-xl font-medium text-(--neutral)">
          {t("marketing:privacy.publication_date")}
        </p>

        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            {t("marketing:privacy.section1.title")}
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
            {t("marketing:privacy.section1.content")}
          </p>
        </section>
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            {t("marketing:privacy.section2.title")}
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
            {t("marketing:privacy.section2.content")}
          </p>
        </section>
        <section>
          <h2 className="text-2xl lg:text-3xl font-bold text-(--primary)">
            {t("marketing:privacy.section3.title")}
          </h2>
          <p className="text-lg lg:text-xl font-medium text-(--neutral)">
            {t("marketing:privacy.section3.content")}
          </p>
        </section>
      </div>
    </section>
  );
}