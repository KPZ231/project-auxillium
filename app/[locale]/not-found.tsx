"use client";

import { motion, Variants } from "motion/react";
import Link from "next/link";
import { FiFrown } from "react-icons/fi";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
    },
  };

  return (
    <section className="w-full min-h-[70vh] mt-12 flex items-center justify-center px-6 lg:px-12 py-20 lg:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center"
      >
        {/* Left Side: Content */}
        <div className="flex flex-col gap-10">
          <motion.h1 
            variants={itemVariants}
            className="text-7xl lg:text-9xl font-bold tracking-tight text-(--primary)"
          >
            404
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="border-l-2 border-(--tertiary) pl-8 flex flex-col gap-4"
          >
            <p className="text-xl lg:text-2xl font-medium text-(--primary) tracking-tight">
              Strona nie istnieje.
            </p>
            <p className="text-sm lg:text-base text-(--neutral) max-w-md leading-relaxed">
              Prawdopodobnie podano błędny adres lub strona została przeniesiona pod inny adres URL.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              href="/"
              className="inline-block px-12 py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Powrót do strony głównej
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex justify-center lg:justify-end order-first lg:order-last"
        >
          <FiFrown className="w-64 h-64 lg:w-[450px] lg:h-[450px] text-(--primary)" />
        </motion.div>
      </motion.div>
    </section>
  );
}
