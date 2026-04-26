"use client";
import { motion, Variants } from "motion/react";

interface GridProps {
  title: string;
  subtitle?: string;

  cards: {
    header: string;
    content: string;
  }[];
}

export default function Grid({ title, subtitle, cards }: GridProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
    },
  };

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
      <section className="w-full px-6 lg:px-12 pt-10 lg:pt-16 mt-18">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="max-w-7xl grid grid-cols-2 mx-auto gap-16"
        >
          <motion.div variants={itemVariants} custom={0} className="col-span-2">
            <h2 className="font-bold text-4xl tracking-wide">{title}</h2>
            <p className="text-base font-light tracking-tight text-(--neutral)">
              {subtitle}
            </p>
          </motion.div>

          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index + 1}
              className="border border-(--primary) p-8"
            >
              <h2 className="font-bold text-3xl tracking-wide">
                {card.header}
              </h2>
              <p className="text-base font-light tracking-tight text-(--neutral)">
                {card.content}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
