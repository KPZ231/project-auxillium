"use client";

import { motion, Variants } from "motion/react";
import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface LeadsFiltersProps {
  options: {
    action: string;
    label: string;
    icon: LucideIcon;
  }[];
  selectedOption: string;
  onOptionChange: (option: any) => void;
}

export default function LeadsFilter({
  options,
  selectedOption,
  onOptionChange,
}: LeadsFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string>(selectedOption);

  const containerVariants: Variants = {
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

  return(
    <>
        FilterOptions!
    </>
  );
}
