"use client";

import Button from "../Button/Button";
import { motion, Variants } from "motion/react";

interface PageHeaderProps {
  header: string;
  description: string;
  /** Optional label shown above the header in small caps */
  eyebrow?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  button?: {
    content: string;
    variant: "primary" | "secondary";
    url: string;
  };
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

export default function PageHeader({
  header,
  description,
  eyebrow,
  button,
}: PageHeaderProps) {
  return (
    <section className="w-full px-6 lg:px-12 pt-10 pb-16 mt-16 bg-[#FAFAFA] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto">

        {/* Top rule */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="h-px bg-[#0A0A0A] mb-10 w-12"
        />

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 justify-between">

          {/* Left  eyebrow + header */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {eyebrow && (
              <motion.p
                variants={fadeUp}
                custom={0.05}
                initial="hidden"
                animate="visible"
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#71717A]"
              >
                {eyebrow}
              </motion.p>
            )}

            <motion.h1
              variants={fadeUp}
              custom={0.15}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-[1.08] tracking-tight"
            >
              {header}
            </motion.h1>
          </div>

          {/* Right  description + optional CTA */}
          <div className="lg:w-1/2 flex flex-col gap-6 justify-end">
            <motion.p
              variants={fadeUp}
              custom={0.25}
              initial="hidden"
              animate="visible"
              className="text-base font-light text-[#71717A] leading-[1.65] max-w-md"
            >
              {description}
            </motion.p>

            {button && (
              <motion.div
                variants={fadeUp}
                custom={0.35}
                initial="hidden"
                animate="visible"
              >
                <Button
                  className="w-auto"
                  content={button.content}
                  variant={button.variant}
                  url={button.url}
                  showArrow
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
