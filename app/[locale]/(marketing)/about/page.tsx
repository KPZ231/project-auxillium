"use client";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import Grid from "@/app/components/Grid/Grid";
import BigQuotation from "@/app/components/Testimonial/BigQuotation";
import { useTranslation } from "@/app/context/TranslationContext";

export default function About() {
  const { t, language } = useTranslation();

  return (
    <>
      <HeroSection
        header={t("marketing:about.title")}
        description={t("marketing:about.description")}
        image={{
          src: "/images/background-image.jpeg",
          alt: "Hero Image",
          width: 450,
          height: 450,
        }}
        button={{
          content: t("marketing:hero.cta"),
          variant: "primary",
          url: `/${language}/signup`,
        }}
      ></HeroSection>
      <Grid
        title={t("marketing:about.offer_title")}
        subtitle={t("marketing:about.offer_subtitle")}
        cards={[
          {
            header: t("marketing:about.offer_item1"),
            content: t("marketing:about.offer_item1_desc"),
          },
          {
            header: t("marketing:about.offer_item2"),
            content: t("marketing:about.offer_item2_desc"),
          },
          {
            header: t("marketing:about.offer_item3"),
            content: t("marketing:about.offer_item3_desc"),
          },
          {
            header: t("marketing:about.offer_item4"),
            content: t("marketing:about.offer_item4_desc"),
          },
        ]}
      ></Grid>
      <BigQuotation
        title={t("marketing:about.why_choose_us")}
        quoteContent={t("marketing:about.quote_content")}
        subContent={t("marketing:about.sub_content")}
      ></BigQuotation>
    </>
  );
}
