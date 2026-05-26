"use client";

import { motion, Variants } from "motion/react";
import Button from "../Button/Button";
import { Check } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useState } from "react";

interface PricingProps {
  name: string;
  header: string;
  plans: {
    planName: string;
    cost: number;
    description?: string;
    list: string[];
    priceId?: string;
    button: {
      content: string;
      variant: "primary" | "secondary";
      url: string;
    };
  }[];
}

export default function PricingColumns({ name, header, plans }: PricingProps) {
  const { user, isLoading } = useUser();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleCheckout = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    plan: PricingProps["plans"][0]
  ) => {
    if (plan.cost === 0 || !plan.priceId) return;
    e.preventDefault();
    if (isLoading) return;
    if (!user) {
      window.location.href = plan.button.url;
      return;
    }
    setLoadingPriceId(plan.priceId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: plan.planName, priceId: plan.priceId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch {
      alert("Failed to initiate checkout");
    } finally {
      setLoadingPriceId(null);
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
  };

  return (
    <section className="w-full px-4 lg:px-12 py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14 border-b border-[#0A0A0A] pb-8">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.3em] text-[#71717A] mb-3"
              style={{ fontFamily: 'var(--anonymus-pro)' }}
            >
              {name}
            </p>
            <h2 className="text-4xl lg:text-6xl font-bold text-[#0A0A0A] leading-tight tracking-tight">
              {header}
            </h2>
          </div>
          <span
            className="text-[80px] font-bold text-[#E5E5E5] leading-none select-none hidden lg:block"
            style={{ fontFamily: 'var(--anonymus-pro)' }}
          >
            03
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-[#0A0A0A]">
          {plans.map((plan, index) => {
            const featured = index === 1;
            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={itemVariants}
                className={`relative p-8 md:p-10 flex flex-col min-h-[580px] border-b lg:border-b-0 lg:border-r border-[#0A0A0A] last:border-b-0 lg:last:border-r-0 ${
                  featured ? "bg-[#0A0A0A] text-white" : "bg-[#FAFAFA] text-[#0A0A0A]"
                }`}
              >
                {featured && (
                  <div
                    className="absolute top-0 right-0 text-[10px] px-3 py-1.5 bg-[#FAFAFA] text-[#0A0A0A] uppercase tracking-[0.15em] font-bold"
                    style={{ fontFamily: 'var(--anonymus-pro)' }}
                  >
                    Recommended
                  </div>
                )}

                {/* Plan name */}
                <p className={`text-[11px] uppercase tracking-[0.3em] mb-8 ${featured ? "text-white/50" : "text-[#71717A]"}`}>
                  {plan.planName}
                </p>

                {/* Price */}
                <div className="mb-8 flex items-baseline gap-1.5">
                  <span
                    className="text-5xl md:text-6xl font-bold leading-none"
                    style={{ fontFamily: 'var(--anonymus-pro)' }}
                  >
                    {plan.cost > 0 ? plan.cost : '0'}
                  </span>
                  <span className={`text-lg font-light ${featured ? "text-white/60" : "text-[#71717A]"}`}>
                    PLN
                  </span>
                  <span className={`text-sm ${featured ? "text-white/40" : "text-[#71717A]"}`}>
                    /mc
                  </span>
                </div>

                {/* Divider */}
                <div className={`h-px w-full mb-8 ${featured ? "bg-white/20" : "bg-[#0A0A0A]/10"}`} />

                {/* Description */}
                {plan.description && (
                  <p className={`text-sm font-light leading-relaxed mb-6 ${featured ? "text-white/60" : "text-[#71717A]"}`}>
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-10 flex-1">
                  {plan.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-light">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  className="w-full justify-center"
                  content={loadingPriceId === plan.priceId ? "Processing..." : plan.button.content}
                  variant={featured ? "secondary" : "primary"}
                  url={plan.button.url}
                  showArrow={loadingPriceId !== plan.priceId}
                  onClick={(e) => handleCheckout(e, plan)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
