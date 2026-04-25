"use client";

import Button from "../Button/Button";
import { motion, Variants } from "motion/react";

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
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { delay: 0.3, duration: 0.5, ease: "backOut" } 
    }
  };

  return (
    <>
      <div className="w-full px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 items-center text-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-(--primary) leading-tight">
              {content}
            </h2>
          </motion.div>
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-base max-w-2xl sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wide text-(--neutral)">
              {description}
            </p>
          </motion.div>
          <motion.div 
            variants={buttonVariants}
            initial="hidden" 
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Button
              content={button.content}
              variant={button.variant}
              url={button.url}
              showArrow={true}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
