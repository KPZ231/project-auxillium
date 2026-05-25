"use client";
import { motion, Variants } from "motion/react";

interface BigQuotationProps {
  title: string;
  quoteContent: string;
  subContent: string;
}

export default function BigQuotation({
  title,
  quoteContent,
  subContent,
}: BigQuotationProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  return (
    <>
      <section className="w-full px-4 lg:px-12 pt-16 lg:pt-24 mt-20 mb-30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-7xl mx-auto flex flex-col gap-16"
        >
          <motion.div variants={itemVariants} custom={0}>
            <h2 className="font-bold text-4xl tracking-tight text-(--primary)">
              {title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            <motion.div
              variants={itemVariants}
              custom={1}
              className="lg:col-span-7 flex gap-8 lg:gap-12"
            >
              <div className="w-1.5 bg-(--primary) self-stretch shrink-0" />
              <h3 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-tighter leading-[0.9] text-(--primary)">
                &quot;{quoteContent}&quot;
              </h3>
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={2}
              className="lg:col-span-5 pt-4"
            >
              <p className="font-medium text-xl lg:text-2xl leading-relaxed tracking-tight text-(--neutral)">
                {subContent}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
