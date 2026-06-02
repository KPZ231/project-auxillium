'use client'

import { motion, useInView } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from "@/app/context/TranslationContext";

function AnimatedCounter({
  target,
  suffix = '',
  inView,
}: {
  target: number;
  suffix?: string;
  inView: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, target]);

  return <>{display.toLocaleString()}{suffix}</>;
}

export default function TemplateAnalitics() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const metrics = [
    { value: 124380, suffix: ' zł', label: t("dashboard:leads.metric_revenue", "Monthly Revenue"), bar: 82 },
    { value: 48, suffix: '', label: t("dashboard:leads.metric_clients", "Active Clients"), bar: 64 },
    { value: 30, suffix: '%', label: t("dashboard:leads.metric_time_saved", "Time Saved"), bar: 30 },
  ];

  const trends = [
    {
      label: t("dashboard:leads.efficiency_trend", "Efficiency Trend"),
      desc: t("dashboard:leads.efficiency_desc", "Teams using Auxilium see an average 30% increase in efficiency within the first quarter of use."),
      stat: '+30%',
      sublabel: t("dashboard:leads.efficiency_sublabel", "vs. no system"),
    },
    {
      label: t("dashboard:leads.revenue_growth", "Revenue Growth"),
      desc: t("dashboard:leads.revenue_desc", "Centralizing CRM and finances allows identifying sales opportunities 2× faster than with scattered tools."),
      stat: '2×',
      sublabel: t("dashboard:leads.revenue_sublabel", "faster identification"),
    },
  ];

  return (
    <section ref={ref} className="w-full px-6 lg:px-12 py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16 border-l-[3px] border-[#0A0A0A] pl-6"
        >
          <p
            className="text-xs uppercase tracking-[0.3em] text-[#71717A] mb-2"
            style={{ fontFamily: 'var(--anonymus-pro)' }}
          >
            {t("dashboard:leads.analytics_title", "Przykładowe Analityki")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] leading-tight">
            {t("dashboard:leads.analytics_heading", "Data that speaks for itself")}
          </h2>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#0A0A0A]">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="p-8 md:p-10 border-b sm:border-b-0 sm:border-r border-[#0A0A0A] last:border-r-0 flex flex-col gap-5"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#71717A]">
                {metric.label}
              </p>
              <p
                className="text-4xl md:text-5xl font-bold text-[#0A0A0A] leading-none"
                style={{ fontFamily: 'var(--anonymus-pro)' }}
              >
                <AnimatedCounter target={metric.value} suffix={metric.suffix} inView={inView} />
              </p>
              <div className="h-[2px] bg-[#E5E5E5] relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-[#0A0A0A]"
                  initial={{ width: '0%' }}
                  animate={inView ? { width: `${metric.bar}%` } : { width: '0%' }}
                  transition={{ duration: 1.4, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trend columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-x border-b border-[#0A0A0A] divide-y lg:divide-y-0 lg:divide-x divide-[#0A0A0A]">
          {trends.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.15, ease: 'easeOut' }}
              className="p-8 md:p-10 flex flex-col gap-4"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#71717A]">
                {item.label}
              </p>
              <div className="flex items-end justify-between gap-6">
                <p className="text-sm text-[#0A0A0A] font-light leading-relaxed max-w-xs">
                  {item.desc}
                </p>
                <div className="text-right shrink-0">
                  <p
                    className="text-4xl md:text-5xl font-bold text-[#0A0A0A] leading-none"
                    style={{ fontFamily: 'var(--anonymus-pro)' }}
                  >
                    {item.stat}
                  </p>
                  <p className="text-[11px] text-[#71717A] tracking-wide mt-1">
                    {item.sublabel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
