"use client";

import { useLayoutEffect, useRef } from "react";
import Button from "../Button/Button";
import Image from "next/image";
import gsap from "gsap";
import SplitType from "split-type";
import { motion } from "motion/react";

interface HeroProps {
  header: string;
  description: string;

  button: {
    content: string;
    variant: "primary" | "secondary";
    url: string;
  };

  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export default function HeroSection({
  header,
  description,
  button,
  image,
}: HeroProps) {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const headerAnimRef = useRef<gsap.core.Timeline | null>(null);
  const descAnimRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!headerRef.current || !descriptionRef.current) return;

    // Split text into words AND characters for typewriter effect
    // This keeps words together (no breaking in the middle of a word)
    const splitHeader = new SplitType(headerRef.current, {
      types: "words,chars",
    });
    const splitDesc = new SplitType(descriptionRef.current, {
      types: "words,chars",
    });

    const animate = (
      split: SplitType,
      animRef: React.MutableRefObject<gsap.core.Timeline | null>,
    ) => {
      if (!split.chars) return;
      if (animRef.current) animRef.current.revert();

      const tl = gsap.timeline();
      animRef.current = tl;

      // Ensure words don't break across lines
      if (split.words) {
        gsap.set(split.words, {
          display: "inline-block",
          whiteSpace: "nowrap",
        });
      }

      // Hide all chars initially
      gsap.set(split.chars, { opacity: 0 });

      tl.to(split.chars, {
        opacity: 1,
        duration: 0.01,
        stagger: 0.05,
        ease: "none",
      });
    };

    // Initial animation
    animate(splitHeader, headerAnimRef);
    animate(splitDesc, descAnimRef);

    // Click listeners
    const handleHeaderClick = () => animate(splitHeader, headerAnimRef);
    const handleDescClick = () => animate(splitDesc, descAnimRef);

    const h = headerRef.current;
    const d = descriptionRef.current;

    h.addEventListener("click", handleHeaderClick);
    d.addEventListener("click", handleDescClick);

    return () => {
      splitHeader.revert();
      splitDesc.revert();
      h.removeEventListener("click", handleHeaderClick);
      d.removeEventListener("click", handleDescClick);
    };
  }, []);

  return (
    <main className="w-full px-6 lg:px-12 pt-10 lg:pt-16 mt-18">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
          <h1
            ref={headerRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-(--primary) leading-tight cursor-pointer select-none"
            dangerouslySetInnerHTML={{ __html: header }}
          />

          <p
            ref={descriptionRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wide text-(--neutral) max-w-xl mx-auto lg:mx-0 cursor-pointer select-none"
          >
            {description}
          </p>

          <div className="pt-4 flex justify-center lg:justify-start">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Button
                className="w-full sm:w-auto"
                content={button.content}
                variant={button.variant}
                url={button.url}
                showArrow={true}
              />
            </motion.div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl aspect-4/3 overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
