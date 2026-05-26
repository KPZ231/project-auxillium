"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQSectionProps {
  header: string;
  description: string;
  faq: {
    question: string;
    answer: string;
  }[];
}

export default function FAQSection({ header, description, faq }: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full px-6 lg:px-12 py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16 border-b border-[#0A0A0A] pb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight tracking-tight"
          >
            {header}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.25em] text-[#71717A] font-light lg:text-right lg:max-w-[220px] lg:pt-4"
          >
            {description}
          </motion.p>
        </div>

        {/* Accordion */}
        <div>
          {faq.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="border-b border-[#E5E5E5]"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full py-8 flex items-start gap-8 text-left group"
                >
                  {/* Ordinal number */}
                  <span
                    className="text-[38px] font-bold leading-none text-[#E5E5E5] shrink-0 transition-colors duration-200 group-hover:text-[#D4D4D8] select-none"
                    style={{ fontFamily: 'var(--anonymus-pro)' }}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Question + icon */}
                  <div className="flex-1 flex items-center justify-between gap-4 pt-1.5">
                    <h3
                      className={`text-xl md:text-2xl font-bold transition-colors duration-200 ${
                        isOpen ? "text-[#0A0A0A]" : "text-[#0A0A0A]/70"
                      }`}
                    >
                      {item.question}
                    </h3>
                    <div
                      className={`shrink-0 w-8 h-8 border flex items-center justify-center transition-all duration-200 ${
                        isOpen
                          ? "bg-[#0A0A0A] border-[#0A0A0A]"
                          : "border-[#D4D4D8] bg-transparent"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#0A0A0A]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mb-8"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pl-[calc(38px+2rem)] text-base text-[#71717A] font-light leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
