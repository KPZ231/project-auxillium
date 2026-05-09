"use client";
import { motion, Variants } from "motion/react";
import Button from "@/app/components/Button/Button";
import MetricBoxes from "./MetricBoxes";
import ActivityAndTasks from "./ActivityAndTasks";

import { useTranslation } from "@/app/context/TranslationContext";

export default function MetricsOverview() {
  const { t, language } = useTranslation();
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <motion.div
        className="flex flex-row justify-between px-4 py-2 w-full items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="flex flex-col gap-2">
          <h3 className="font-light text-base text-(--neutral) tracking-tight uppercase ">
            {t("dashboard:metrics.overview_title", "Przegląd Danych")}
          </h3>
          <h2 className="font-bold text-3xl tracking-wide uppercase ">
            {t("dashboard:metrics.overview_subtitle", "Dane z tego tygodnia")}
          </h2>
        </div>
        <div>
          <Button
            content={t("dashboard:metrics.generate_report", "Wygeneruj Raport")}
            url={`/${language}/dashboard/generate/new-report`}
            variant="primary"
          ></Button>
        </div>
      </motion.div>
      <MetricBoxes />
      <ActivityAndTasks />
    </>
  );
}
