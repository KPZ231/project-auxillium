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

  const handleCheckout = async (e: React.MouseEvent<HTMLAnchorElement>, plan: PricingProps["plans"][0]) => {
    if (plan.cost === 0 || !plan.priceId) {
      // Free plan or no price ID -> allow default behavior
      return;
    }

    e.preventDefault();

    if (isLoading) {
      // Wait for auth to load
      return;
    }

    if (!user) {
      // Not logged in -> go to register
      window.location.href = plan.button.url;
      return;
    }
    setLoadingPriceId(plan.priceId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.planName,
          priceId: plan.priceId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error(data.error);
        alert(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to initiate checkout");
    } finally {
      setLoadingPriceId(null);
    }
  };

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

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full px-4 lg:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-(--neutral) mb-2">
              {name}
            </p>
          </motion.div>

          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-(--primary)">
              {header}
            </h2>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-(--primary) overflow-hidden">
          {plans.map((plan, index) => {
            const featured = index === 1;

            return (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
              >
                <div
                  key={index}
                  className={`relative p-6 md:p-10 flex flex-col min-h-[620px] border-b lg:border-b-0 lg:border-r last:border-b-0 lg:last:border-r-0 border-(--primary)
                ${
                  featured
                    ? "bg-(--primary) text-(--secondary)"
                    : "bg-(--secondary) text-(--primary)"
                }`}
                >
                  {/* Badge */}
                  {featured && (
                    <div className="absolute top-0 right-0 text-xs px-3 py-2 bg-(--secondary) text-(--primary) uppercase tracking-wide font-semibold">
                      Recommended
                    </div>
                  )}

                  {/* Plan name */}
                  <p
                    className={`text-sm uppercase tracking-[0.3em] mb-6 ${
                      featured ? "text-white/70" : "text-(--neutral)"
                    }`}
                  >
                    {plan.planName}
                  </p>

                  {/* Price */}
                  <div className="mb-8 flex flex-row items-end">
                    <h3 className="text-5xl font-bold leading-none">
                      {plan.cost > 0 ? `${plan.cost} PLN` : "0 PLN"}
                    </h3>

                    <span
                      className={`text-sm ${
                        featured ? "text-white/70" : "text-(--neutral)"
                      }`}
                    >
                      /mc
                    </span>
                  </div>

                  {/* Divider */}
                  <div
                    className={`h-px w-full mb-8 ${
                      featured ? "bg-white/20" : "bg-black/10"
                    }`}
                  />

                  {/* Features */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.list.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-base">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{item}</span>
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
