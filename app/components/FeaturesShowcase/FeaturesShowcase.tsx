"use client";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import type { LucideIcon } from "lucide-react";

export interface ShowcaseFeature {
  ordinal: string;
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  image: {
    src: string;
    alt: string;
  };
}

interface FeaturesShowcaseProps {
  features: ShowcaseFeature[];
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const imageVariantsLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const imageVariantsRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

function FeatureRow({
  feature,
  index,
}: {
  feature: ShowcaseFeature;
  index: number;
}) {
  const imageOnLeft = index % 2 === 0;
  const Icon = feature.icon;

  const TextBlock = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={`flex flex-col justify-center gap-8 px-8 md:px-12 lg:px-16 py-16 md:py-24 ${
        imageOnLeft ? "lg:pl-16 lg:pr-8" : "lg:pr-16 lg:pl-8"
      }`}
    >
      {/* Ordinal + icon row */}
      <motion.div variants={textVariants} className="flex items-center justify-between">
        <span
          className="text-[80px] md:text-[100px] font-light leading-none text-[#D4D4D8] select-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {feature.ordinal}
        </span>
        <div className="w-10 h-10 border border-[#0A0A0A] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#0A0A0A]" />
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div variants={textVariants} className="h-px w-full bg-[#0A0A0A]" />

      {/* Title */}
      <motion.h2
        variants={textVariants}
        className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#0A0A0A] leading-tight tracking-tight"
      >
        {feature.title}
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={textVariants}
        className="text-base md:text-lg text-[#71717A] leading-relaxed max-w-md"
      >
        {feature.description}
      </motion.p>

      {/* Tags */}
      {feature.tags.length > 0 && (
        <motion.div variants={textVariants} className="flex flex-wrap gap-2">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#71717A] border border-[#D4D4D8] px-3 py-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

  const ImageBlock = (
    <motion.div
      variants={imageOnLeft ? imageVariantsLeft : imageVariantsRight}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative w-full h-full min-h-[320px] md:min-h-[460px] lg:min-h-0 overflow-hidden"
    >
      <Image
        src={feature.image.src}
        alt={feature.image.alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-[#0A0A0A]/8" />
    </motion.div>
  );

  return (
    <div className="border-t border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          {imageOnLeft ? (
            <>
              {ImageBlock}
              {TextBlock}
            </>
          ) : (
            <>
              {TextBlock}
              {ImageBlock}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesShowcase({ features }: FeaturesShowcaseProps) {
  return (
    <section className="w-full px-0">
      {features.map((feature, index) => (
        <FeatureRow key={feature.ordinal} feature={feature} index={index} />
      ))}
      <div className="border-t border-[#0A0A0A]" />
    </section>
  );
}
