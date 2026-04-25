"use client";
import { motion, Variants } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQSectionProps {
  header: string;
  description: string;

  faq: {
    question: string;
    answer: string;
  }[];
}

export default function FAQSection({
  header,
  description,
  faq,
}: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const cardVariants: Variants = {
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

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full px-6 lg:px-12 py-24 bg-(--secondary)">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 justify-between">
        {/* Left Side: Header & Description */}
        <div className="lg:w-1/3">
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="tracking-tight text-4xl md:text-5xl lg:text-6xl text-(--primary) font-bold leading-tight mb-4">
              {header}
            </h2>
          </motion.div>
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="tracking-widest text-sm text-(--neutral) font-light uppercase">
              {description}
            </p>
          </motion.div>
        </div>

        {/* Right Side: Accordion List */}
        <div className="lg:w-2/3 border-t border-(--primary)">
          {faq.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
              >
                <div
                  className="border-b border-(--primary) transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full py-8 flex justify-between items-center text-left hover:bg-black/5 transition-colors duration-200 group"
                  >
                    <h3
                      className={`tracking-wide text-xl md:text-2xl font-bold transition-colors ${isOpen ? "text-(--primary)" : "text-(--primary)/70"}`}
                    >
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mb-8"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-lg text-(--neutral) font-light leading-relaxed max-w-2xl">
                        {item.answer}
                      </p>
                    </div>
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
