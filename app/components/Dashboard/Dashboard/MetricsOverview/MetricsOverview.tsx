"use client";
import { motion, Variants } from "motion/react";
import Button from "@/app/components/Button/Button";
import MetricBoxes from "./MetricBoxes";
import ActivityAndTasks from "./ActivityAndTasks";
import ClientsLeadWidget from "../Widgets/ClientsLeadWidget";
import RecentDocumentsWidget from "../Widgets/RecentDocumentsWidget";
import CostsWidget from "../Widgets/CostsWidget";

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
        className="flex flex-col sm:flex-row justify-between px-4 py-2 w-full items-start sm:items-center gap-4"
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

      {/* New Widgets Row */}
      <section className="w-full px-4 md:px-8 mb-16">
        <motion.div
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          <ClientsLeadWidget />
          <RecentDocumentsWidget />
          <CostsWidget />
        </motion.div>
      </section>
    </>
  );
}
