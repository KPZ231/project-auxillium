"use client";
import Button from "../Button/Button";
import { motion, Variants } from "motion/react";
import Image from "next/image";

interface PageHeaderProps {
  header: string;
  description: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  button: {
    content: string;
    variant: "primary" | "secondary";
    url: string;
  };
}

export default function PageHeader({
  header,
  description,
  image,
  button,
}: PageHeaderProps) {
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      <section className="w-full px-6 lg:px-12 py-24 bg-(--secondary)">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 justify-between">
          {/* Left Side: Header & Description */}
          <div className="lg:w-1/3 flex flex-col gap-6 lg:gap-8 justify-center">
            <motion.div
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="tracking-tight text-4xl md:text-5xl lg:text-6xl text-(--primary) font-bold leading-tight">
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

            <motion.div
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Button
                content={button.content}
                variant={button.variant}
                url={button.url}
                showArrow={true}
              ></Button>
            </motion.div>
          </div>

          {/* Right Side: Image */}
          <div className="lg:w-2/3 flex items-center">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="w-full h-auto object-cover"
              priority
            ></Image>
          </div>
        </div>
      </section>
    </>
  );
}
