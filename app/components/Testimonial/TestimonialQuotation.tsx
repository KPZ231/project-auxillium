"use client";
import { motion, Variants } from "motion/react";

interface TestimonialQuotationProps {
  name: string;
  header: string;
}

export default function TestimonialQuotation({
  name,
  header,
}: TestimonialQuotationProps) {
  
  const textVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number], // easeOutCubic
      },
    }),
  };

  

  return (
    <>
      <div className="w-full bg-(--primary) min-h-[400px] flex items-center justify-center px-6 lg:px-12">
        <div className="max-w-7xl w-full flex flex-col gap-6 items-center text-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="tracking-widest text-lg text-(--neutral) font-light uppercase">
              {name}
            </p>
          </motion.div>

          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-row justify-center"
          >
            <h2 className="tracking-wide text-3xl md:text-4xl lg:text-5xl w-full md:w-3/4 text-(--secondary) font-bold leading-tight">
              {header}
            </h2>
          </motion.div>
        </div>
      </div>
    </>
  );
}
