"use client";
import { motion, Variants } from "motion/react";

interface GridProps {
  title: string;
  subtitle?: string;
  cards: readonly {
    header: string;
    content: string;
  }[];
}

export default function Grid({ title, subtitle, cards }: GridProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section className="w-full px-6 lg:px-12 py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16 border-l-[3px] border-[#0A0A0A] pl-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#71717A] font-light mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 border border-[#0A0A0A]">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={itemVariants}
              className={`p-8 md:p-10 flex flex-col gap-6 border-[#0A0A0A] group hover:bg-[#F4F4F5] transition-colors duration-150
                ${index % 2 === 0 ? 'md:border-r' : ''}
                ${index < cards.length - 2 ? 'border-b' : ''}
                ${cards.length % 2 !== 0 && index === cards.length - 1 ? 'md:col-span-2' : ''}
              `}
            >
              {/* Ordinal */}
              <span
                className="text-[11px] uppercase tracking-[0.3em] text-[#D4D4D8] select-none"
                style={{ fontFamily: 'var(--anonymus-pro)' }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Thin rule */}
              <div className="h-px w-full bg-[#E5E5E5] group-hover:bg-[#D4D4D8] transition-colors duration-150" />

              {/* Content */}
              <div className="flex flex-col gap-3 flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] leading-tight tracking-tight">
                  {card.header}
                </h3>
                <p className="text-sm text-[#71717A] font-light leading-relaxed">
                  {card.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
