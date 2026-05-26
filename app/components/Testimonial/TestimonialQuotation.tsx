"use client";
import { motion } from "motion/react";

interface TestimonialQuotationProps {
  name: string;
  header: string;
}

export default function TestimonialQuotation({ name, header }: TestimonialQuotationProps) {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 lg:px-12 py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center">

          {/* Giant decorative quote mark */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="shrink-0 select-none -mb-6 lg:mb-0 lg:-mr-6"
            aria-hidden
          >
            <span className="block text-[160px] md:text-[200px] lg:text-[260px] font-bold leading-none text-white/8">
              &ldquo;
            </span>
          </motion.div>

          {/* Content */}
          <div className="flex flex-col gap-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-[11px] uppercase tracking-[0.35em] text-white/40"
            >
              {name}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight"
            >
              {header}
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="h-px bg-white/20 origin-left"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
