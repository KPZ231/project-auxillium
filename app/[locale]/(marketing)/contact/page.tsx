"use client";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import ContactForm from "@/app/components/ContactForm/ContactForm";
import { useTranslation } from "@/app/context/TranslationContext";

export default function Contact() {
  const { t, language } = useTranslation();

  return (
    <>
      <HeroSection
        header={t("marketing:contact.title")}
        description={t("marketing:contact.description")}
        image={{
          src: "/images/background-image-3.jpeg",
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
      <ContactForm />
    </>
  );
}
