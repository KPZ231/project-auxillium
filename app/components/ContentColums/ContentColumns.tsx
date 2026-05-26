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

export default function ContentColumns({ count, content }: ContentColumnsProps) {
  if (count > 4) {
    throw new Error("Content columns count must be less than or equal to 4");
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const cellVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };

  return (
    <section className="w-full px-6 lg:px-12 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-(--primary)"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {content.map((item, index) => (
            <motion.div
              key={index}
              variants={cellVariants}
              className="relative bg-(--secondary) p-8 md:p-10 flex flex-col gap-8 group transition-colors duration-150 hover:bg-[#F4F4F5]"
            >
              {/* Ordinal + icon row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs tracking-[0.3em] text-(--neutral) uppercase select-none"
                  style={{ fontFamily: "var(--secondary-font)" }}
                >
                  0{index + 1}
                </span>
                <div className="w-8 h-8 border border-(--primary) flex items-center justify-center shrink-0 transition-colors duration-150 group-hover:bg-(--primary)">
                  <item.icon className="w-3.5 h-3.5 text-(--primary) transition-colors duration-150 group-hover:text-(--secondary)" />
                </div>
              </div>

              {/* Thin rule */}
              <div className="h-px w-full bg-(--primary)" />

              {/* Content */}
              <div className="flex flex-col gap-4 flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-(--primary) leading-tight tracking-tight">
                  {item.header}
                </h2>
                <p className="text-sm md:text-base text-(--neutral) leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
