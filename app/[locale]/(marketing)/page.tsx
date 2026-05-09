"use client";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import ContentColumns from "@/app/components/ContentColums/ContentColumns";
import { Zap } from "lucide-react";
import TemplateAnalitics from "@/app/components/Analistics/TemplateAnalitics";
import TestimonialQuotation from "@/app/components/Testimonial/TestimonialQuotation";
import PricingColumns from "@/app/components/Pricing/PricingColumns";
import FAQSection from "@/app/components/FAQ/FaqSection";
import CTA from "@/app/components/CTA/CTA";
import { useTranslation } from "@/app/context/TranslationContext";

export default function Home() {
  const { t, language } = useTranslation();

  const contentColumnsData = [
    {
      header: t("marketing:features.title"),
      description: t("marketing:features.description"),
      icon: Zap,
    },
    {
      header: t("marketing:features.subtitle"),
      description: t("marketing:features.description"),
      icon: Zap,
    },
    {
      header: t("marketing:features.subtitle"),
      description: t("marketing:features.description"),
      icon: Zap,
    },
  ];

  return (
    <>
      <HeroSection
        header={t("marketing:hero.title")}
        description={t("marketing:hero.subtitle")}
        button={{
          content: t("marketing:hero.cta"),
          variant: "primary",
          url: `/${language}/signup`,
        }}
        image={{
          src: "/images/heroImage.png",
          alt: "Auxillium Logo",
          width: 450,
          height: 450,
        }}
      ></HeroSection>
      <ContentColumns count={3} content={contentColumnsData}></ContentColumns>
      <TemplateAnalitics></TemplateAnalitics>
      <TestimonialQuotation
        name={t("marketing:testimonials.title")}
        header={t("marketing:testimonials.subtitle")}
      ></TestimonialQuotation>
      <PricingColumns
        name={t("marketing:pricing.free")}
        header={t("marketing:pricing.title")}
        plans={[
          {
            planName: t("marketing:pricing.free"),
            cost: 0,
            description: t("marketing:pricing.free_desc"),
            list: [t("marketing:pricing.free_desc"), "Lorem", "Lorem"],
            button: {
              content: t("marketing:pricing.cta"),
              variant: "primary",
              url: `/${language}/signup`,
            },
          },
          {
            planName: t("marketing:pricing.pro"),
            cost: 100,
            description: t("marketing:pricing.pro_desc"),
            list: [t("marketing:pricing.pro_desc"), "Lorem", "Lorem"],
            button: {
              content: t("marketing:pricing.cta"),
              variant: "primary",
              url: `/${language}/signup`,
            },
          },
          {
            planName: t("marketing:pricing.enterprise"),
            cost: 1000,
            description: t("marketing:pricing.enterprise_desc"),
            list: [t("marketing:pricing.enterprise_desc"), "Lorem", "Lorem"],
            button: {
              content: t("marketing:pricing.cta"),
              variant: "primary",
              url: `/${language}/signup`,
            },
          },
        ]}
      ></PricingColumns>
      <FAQSection
        header={t("marketing:faq.title")}
        description={t("marketing:faq.subtitle")}
        faq={[
          {
            question: t("marketing:faq.q1"),
            answer: t("marketing:faq.a1"),
          },
          {
            question: t("marketing:faq.q2"),
            answer: t("marketing:faq.a2"),
          },
          {
            question: t("marketing:faq.q3"),
            answer: t("marketing:faq.a3"),
          },
        ]}
      />

      <CTA
        content={t("marketing:cta.title")}
        description={t("marketing:cta.subtitle")}
        button={{
          content: t("marketing:cta.cta"),
          variant: "primary",
          url: `/${language}/signup`,
        }}
      ></CTA>
    </>
  );
}
