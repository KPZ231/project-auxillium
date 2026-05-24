"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import SplitType from "split-type";
import { motion } from "motion/react";
import {
  TrendingUp,
  Users,
  CheckSquare,
  ArrowRight,
  BarChart3,
  Clock,
} from "lucide-react";

interface HeroProps {
  header: string;
  description: string;
  button: {
    content: string;
    variant: "primary" | "secondary";
    url: string;
  };
  buttonSecondary?: {
    content: string;
    url: string;
  };
  socialProof?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

/** Minimal stat card — flat, bordered, no shadows */
function StatCard({
  label,
  value,
  delta,
  positive = true,
  delay = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-[#E5E5E5] p-5"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717A] mb-3">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#0A0A0A] leading-none mb-2">
        {value}
      </p>
      {delta && (
        <span
          className={`text-[11px] font-medium ${
            positive ? "text-[#16A34A]" : "text-[#DC2626]"
          }`}
        >
          {positive ? "↑" : "↓"} {delta}
        </span>
      )}
    </motion.div>
  );
}

/** Minimal task row */
function TaskRow({
  label,
  done,
  delay = 0,
}: {
  label: string;
  done: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 py-2 border-b border-[#F4F4F5] last:border-b-0"
    >
      <div
        className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${
          done
            ? "bg-[#0A0A0A] border-[#0A0A0A]"
            : "bg-white border-[#D4D4D8]"
        }`}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="#FAFAFA"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-[13px] font-normal ${
          done ? "line-through text-[#71717A]" : "text-[#0A0A0A]"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

export default function HeroSection({
  header,
  description,
  button,
  buttonSecondary,
  socialProof,
}: HeroProps) {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const headerAnimRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!headerRef.current) return;

    const splitHeader = new SplitType(headerRef.current, {
      types: "words,chars",
    });

    const animate = (split: SplitType) => {
      if (!split.chars) return;
      if (headerAnimRef.current) headerAnimRef.current.revert();

      const tl = gsap.timeline();
      headerAnimRef.current = tl;

      if (split.words) {
        gsap.set(split.words, { display: "inline-block", whiteSpace: "nowrap" });
      }
      gsap.set(split.chars, { opacity: 0 });
      tl.to(split.chars, { opacity: 1, duration: 0.01, stagger: 0.04, ease: "none" });
    };

    animate(splitHeader);

    return () => {
      if (headerAnimRef.current) {
        headerAnimRef.current.kill();
        headerAnimRef.current = null;
      }
      splitHeader.revert();
    };
  }, []);

  return (
    <main className="w-full px-6 lg:px-12 pt-8 pb-16 lg:pt-12 mt-32 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── LEFT: Text Content ── */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex w-fit items-center gap-2 border border-[#D4D4D8] px-3 py-1"
          >
            <span className="w-1.5 h-1.5 bg-[#0A0A0A] block" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#71717A] font-medium">
              Business OS
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            ref={headerRef}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#0A0A0A] leading-[1.05] select-none"
            dangerouslySetInnerHTML={{ __html: header }}
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="text-base lg:text-lg font-light text-[#71717A] max-w-md leading-[1.65]"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Link
              href={button.url}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#FAFAFA] px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#1A1A1A] transition-colors duration-150 group"
            >
              {button.content}
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>

            {buttonSecondary && (
              <Link
                href={buttonSecondary.url}
                className="inline-flex items-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#0A0A0A] hover:text-[#FAFAFA] transition-colors duration-150"
              >
                {buttonSecondary.content}
              </Link>
            )}
          </motion.div>

          {/* Social proof */}
          {socialProof && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-[12px] text-[#71717A] tracking-wide"
            >
              {socialProof}
            </motion.p>
          )}
        </div>

        {/* ── RIGHT: Dashboard Preview ── */}
        <div className="w-full lg:w-[55%] relative">
          <div className="grid grid-cols-2 gap-3">

            {/* Stat: Total Revenue */}
            <StatCard
              label="Przychód miesięczny"
              value="124 380 zł"
              delta="21% vs ost. miesiąc"
              positive
              delay={0.5}
            />

            {/* Stat: Active Clients */}
            <StatCard
              label="Aktywni klienci"
              value="48"
              delta="4 nowych"
              positive
              delay={0.6}
            />

            {/* Task list card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
              className="col-span-2 bg-white border border-[#E5E5E5] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                  Zadania — dziś
                </p>
                <CheckSquare className="w-4 h-4 text-[#D4D4D8]" />
              </div>
              <TaskRow label="Przegląd oferty dla klienta ABC" done delay={0.75} />
              <TaskRow label="Spotkanie z zespołem sprzedaży" done delay={0.8} />
              <TaskRow label="Raport wydajności Q2" done={false} delay={0.85} />
              <TaskRow label="Onboarding — nowy pracownik" done={false} delay={0.9} />
            </motion.div>

            {/* Bottom row: two mini metric cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.4, ease: "easeOut" }}
              className="bg-[#0A0A0A] border border-[#0A0A0A] p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                  Czas reakcji
                </p>
                <Clock className="w-4 h-4 text-white/30" />
              </div>
              <p className="text-3xl font-bold text-white leading-none">2.4h</p>
              <p className="text-[11px] text-white/40 mt-2">śr. czas odpowiedzi</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.4, ease: "easeOut" }}
              className="bg-white border border-[#E5E5E5] p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                  Zespół
                </p>
                <Users className="w-4 h-4 text-[#D4D4D8]" />
              </div>
              <p className="text-3xl font-bold text-[#0A0A0A] leading-none">12</p>
              <p className="text-[11px] text-[#71717A] mt-2">aktywnych członków</p>
            </motion.div>

          </div>

          {/* Subtle bottom border accent */}
          <div className="absolute -bottom-4 left-0 right-0 h-px bg-[#E5E5E5]" />
        </div>

      </div>
    </main>
  );
}
