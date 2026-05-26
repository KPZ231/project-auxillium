"use client";
import { motion } from "motion/react";

interface BigQuotationProps {
  title: string;
  quoteContent: string;
  subContent: string;
}

export default function BigQuotation({ title, quoteContent, subContent }: BigQuotationProps) {
  return (
    <section className="w-full px-6 lg:px-12 py-24 lg:py-32 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Section title row */}
        <div className="flex items-center gap-6 border-b border-[#E5E5E5] pb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0A0A0A] tracking-tight leading-tight"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="h-px bg-[#0A0A0A] flex-1 origin-left"
          />
        </div>

        {/* Quote + sub content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">

          {/* Quote block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 flex gap-8 lg:gap-10"
          >
            <div className="w-1 bg-[#0A0A0A] self-stretch shrink-0" />
            <h3 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tighter leading-[0.9] text-[#0A0A0A]">
              &ldquo;{quoteContent}&rdquo;
            </h3>
          </motion.div>

          {/* Sub content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-8 pt-2"
          >
            <p className="text-lg lg:text-xl font-light leading-relaxed tracking-tight text-[#71717A]">
              {subContent}
            </p>
            <div className="h-px w-16 bg-[#0A0A0A]" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
