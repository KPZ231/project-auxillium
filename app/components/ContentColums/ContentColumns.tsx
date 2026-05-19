"use client";
import { motion, Variants } from "motion/react";

interface ContentColumnsProps {
  count: number;
  content: Array<{
    header: string;
    description: string;
    icon: React.ElementType;
  }>;
}

export default function ContentColumns({
  count,
  content,
}: ContentColumnsProps) {
  if (count > 4) {
    throw new Error("Content columns count must be less than or equal to 4");
  }

  // Define variants for the staggered animation
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

  return (
    <section className="w-full px-6 lg:px-12 pt-6 mt-8 md:mt-12 mb-8 md:mb-12">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 md:gap-12">
        {content.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
            className="w-full sm:w-[45%] lg:w-[22%] flex flex-col gap-4 md:gap-6 border-l border-zinc-200 pl-6 md:pl-8"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-(--primary) flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-(--secondary)" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-(--primary) leading-tight">
                {item.header}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl font-medium tracking-wide text-(--neutral)">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
