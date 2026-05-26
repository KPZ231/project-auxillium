"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface CTAProps {
  content: string;
  description: string;
  button: {
    content: string;
    variant: "primary" | "secondary";
    url: string;
  };
}

export default function CTA({ content, description, button }: CTAProps) {
  return (
    <section className="w-full bg-[#0A0A0A] px-6 lg:px-12 py-24">
      <div className="max-w-7xl mx-auto">

        {/* Decorative top divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6 mb-16"
        >
          <div className="h-px bg-white/15 flex-1" />
          <span
            className="text-[11px] uppercase tracking-[0.35em] text-white/30"
            style={{ fontFamily: 'var(--anonymus-pro)' }}
          >
            Zacznij teraz
          </span>
          <div className="h-px bg-white/15 flex-1" />
        </motion.div>

        {/* Split layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">

          {/* Left: headline */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight max-w-2xl"
          >
            {content}
          </motion.h2>

          {/* Right: description + button */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="flex flex-col gap-8 lg:max-w-xs shrink-0"
          >
            <p className="text-base text-white/50 font-light leading-relaxed">
              {description}
            </p>
            <Link
              href={button.url}
              className="inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#FAFAFA] transition-colors duration-150 group w-fit"
            >
              {button.content}
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
