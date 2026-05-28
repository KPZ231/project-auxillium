"use client";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import FeaturesShowcase from "@/app/components/FeaturesShowcase/FeaturesShowcase";
import CTA from "@/app/components/CTA/CTA";
import { useTranslation } from "@/app/context/TranslationContext";
import { FolderKanban, Users, TrendingUp, Bot, FileText, UserCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Features() {
  const { t, language } = useTranslation();

  const features = [
    {
      ordinal: "01",
      title: t("marketing:features_page.projects_title"),
      description: t("marketing:features_page.projects_desc"),
      tags: [
        t("marketing:features_page.projects_tag1"),
        t("marketing:features_page.projects_tag2"),
        t("marketing:features_page.projects_tag3"),
      ],
      icon: FolderKanban,
      image: { src: "/images/side-view-smiley-man-working-laptop.jpg", alt: "Obraz autorstwa freepik na Magnific" },
    },
    {
      ordinal: "02",
      title: t("marketing:features_page.leads_title"),
      description: t("marketing:features_page.leads_desc"),
      tags: [
        t("marketing:features_page.leads_tag1"),
        t("marketing:features_page.leads_tag2"),
        t("marketing:features_page.leads_tag3"),
      ],
      icon: Users,
      image: { src: "/images/good-deal-businessman-customer.jpg", alt: "Obraz autorstwa gpointstudio na Magnific" },
    },
    {
      ordinal: "03",
      title: t("marketing:features_page.finance_title"),
      description: t("marketing:features_page.finance_desc"),
      tags: [
        t("marketing:features_page.finance_tag1"),
        t("marketing:features_page.finance_tag2"),
        t("marketing:features_page.finance_tag3"),
      ],
      icon: TrendingUp,
      image: { src: "/images/person-looking-finance-graphs.jpg", alt: "Obraz autorstwa pikisuperstar na Magnific" },
    },
    {
      ordinal: "04",
      title: t("marketing:features_page.ai_title"),
      description: t("marketing:features_page.ai_desc"),
      tags: [
        t("marketing:features_page.ai_tag1"),
        t("marketing:features_page.ai_tag2"),
        t("marketing:features_page.ai_tag3"),
      ],
      icon: Bot,
      image: { src: "/images/close-up-laptop-keyboard-colorful-neon-illumination-backlit-keyboard.jpg", alt: "Obraz autorstwa freepik na Magnific" },
    },
    {
      ordinal: "05",
      title: t("marketing:features_page.documents_title"),
      description: t("marketing:features_page.documents_desc"),
      tags: [
        t("marketing:features_page.documents_tag1"),
        t("marketing:features_page.documents_tag2"),
        t("marketing:features_page.documents_tag3"),
      ],
      icon: FileText,
      image: { src: "/images/business-man-workplace.jpg", alt: "Obraz autorstwa freepik na Magnific" },
    },
    {
      ordinal: "06",
      title: t("marketing:features_page.team_title"),
      description: t("marketing:features_page.team_desc"),
      tags: [
        t("marketing:features_page.team_tag1"),
        t("marketing:features_page.team_tag2"),
        t("marketing:features_page.team_tag3"),
      ],
      icon: UserCheck,
      image: { src: "/images/job-colleagues-talking-planning.jpg", alt: "Obraz autorstwa freepik na Magnific" },
    },
  ];

  return (
    <>
      <HeroSection
        header={t("marketing:features_page.hero_title")}
        description={t("marketing:features_page.hero_desc")}
        button={{
          content: t("marketing:features_page.hero_cta"),
          variant: "primary",
          url: `/${language}/register`,
        }}
        buttonSecondary={{
          content: t("marketing:features_page.hero_cta_secondary"),
          url: `/${language}/pricing`,
        }}
      />

      <div className="px-6 lg:px-12">
        <motion.div
          className="max-w-7xl mx-auto border-t border-[#0A0A0A] pt-6 pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span
            className="text-xs uppercase tracking-[0.3em] text-[#71717A]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t("marketing:features_page.section_label")}
          </span>
        </motion.div>
      </div>

      <FeaturesShowcase features={features} />

      <CTA
        content={t("marketing:features_page.cta_title")}
        description={t("marketing:features_page.cta_desc")}
        button={{
          content: t("marketing:features_page.cta_btn"),
          variant: "primary",
          url: `/${language}/pricing`,
        }}
      />
    </>
  );
}
