"use client";
import { motion, Variants } from "motion/react";
import Button from "@/app/components/Button/Button";

export default function MetricsOverview() {
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
        className="flex flex-row justify-between max-w-7xl p-8 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="flex flex-col gap-2">
          <h3 className="font-light text-base text-(--neutral) tracking-tight uppercase ">
            Przegląd Danych
          </h3>
          <h2 className="font-bold text-3xl tracking-wide uppercase ">
            Pokaz danych z tego tygodnia
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <Button
            content="Wygeneruj Raport"
            url="/dashboard/generate/new-report"
            variant="primary"
          ></Button>
        </div>
      </motion.div>
    </>
  );
}
