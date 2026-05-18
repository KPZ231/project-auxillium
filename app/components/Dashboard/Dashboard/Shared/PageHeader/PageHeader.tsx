"use client";
import { motion, Variants } from "motion/react";
import Button from "@/app/components/Button/Button";
import { ReactNode } from "react";

interface Tab {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  tabs?: Tab[];
  currentTab?: string;
  onTabChange?: (value: string) => void;
}

export default function PageHeader({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  tabs,
  currentTab,
  onTabChange,
}: PageHeaderProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="w-full">
      <motion.div
        className="flex flex-row justify-between items-center py-6 px-4 flex-wrap gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Left Side: Text */}
        <motion.div className="flex flex-col gap-1" variants={itemVariants}>
          <h2 className="text-4xl font-black text-black tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm font-medium text-gray-500">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Center: Tabs */}
        {tabs && tabs.length > 0 && onTabChange && (
          <motion.div className="flex bg-[#F4F4F5] p-1 border border-[#E5E5E5] mx-auto" variants={itemVariants}>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`px-6 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors ${
                  currentTab === tab.value ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Right Side: Buttons */}
        {(primaryAction || secondaryAction) && (
          <motion.div
            className="flex flex-row items-center gap-4"
            variants={itemVariants}
          >
            {secondaryAction && (
              <Button
                content={secondaryAction.label}
                url={secondaryAction.href || "#"}
                onClick={secondaryAction.onClick}
                variant="secondary"
                icon={secondaryAction.icon}
              />
            )}
            {primaryAction && (
              <Button
                content={primaryAction.label}
                url={primaryAction.href || "#"}
                onClick={primaryAction.onClick}
                variant="primary"
                icon={primaryAction.icon}
              />
            )}
          </motion.div>
        )}
      </motion.div>

      <hr className="border-gray-200" />
    </section>
  );
}
