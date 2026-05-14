"use client";
import VideoPlayer from "@/app/components/VideoPlayer/VideoPlayer";
import PricingColumns from "@/app/components/Pricing/PricingColumns";
import CTA from "@/app/components/CTA/CTA";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import { useTranslation } from "@/app/context/TranslationContext";

export default function Pricing() {
  const { t, language } = useTranslation();

  return (
    <>
      <HeroSection
        header={t("marketing:pricing.title")}
        description={t("marketing:pricing.subtitle")}
        image={{
          src: "/images/background-image-4.jpeg",
          alt: "Hero Image",
          width: 450,
          height: 450,
        }}
        button={{
          content: t("marketing:pricing.cta"),
          variant: "primary",
          url: `/${language}/signup`,
        }}
      ></HeroSection>
      <VideoPlayer src="/videos/pricing.mov"></VideoPlayer>
      <PricingColumns
        name={t("marketing:pricing.title")}
        header={t("marketing:pricing.subtitle")}
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
