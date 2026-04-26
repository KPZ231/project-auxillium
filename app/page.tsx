"use client";
import HeroSection from "./components/HeroSection/HeroSection";
import ContentColumns from "./components/ContentColums/ContentColumns";
import { Zap } from "lucide-react";
import TemplateAnalitics from "./components/Analistics/TemplateAnalitics";
import TestimonialQuotation from "./components/Testimonial/TestimonialQuotation";
import PricingColumns from "./components/Pricing/PricingColumns";
import FAQSection from "./components/FAQ/FaqSection";
import CTA from "./components/CTA/CTA";

export default function Home() {
  const contentColumnsData = [
    {
      header: "Zaoszczędź do 30%",
      description: "Dzięki automatyzacji procesów oszczędzasz czas i pieniądze",
      icon: Zap,
    },
    {
      header: "Zwiększ efektywność",
      description: "Dzięki automatyzacji procesów oszczędzasz czas i pieniądze",
      icon: Zap,
    },
    {
      header: "Zwiększ efektywność",
      description: "Dzięki automatyzacji procesów oszczędzasz czas i pieniądze",
      icon: Zap,
    },
  ];

  return (
    <>
      <HeroSection
        header="AUXILLIUM <br/> nowa definicja zarządzania"
        description="Minimalizm, który napędza twój biznes"
        button={{
          content: "Zacznij teraz",
          variant: "primary",
          url: "/signup",
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
        name="Filozofia"
        header="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."
      ></TestimonialQuotation>
      <PricingColumns
        name="Cennik"
        header="Sprawdź nasze plany"
        plans={[
          {
            planName: "Free",
            cost: 0,
            description: "Darmowy plan",
            list: ["Darmowy plan", "Lorem", "Lorem"],
            button: {
              content: "Zacznij teraz",
              variant: "primary",
              url: "/signup",
            },
          },
          {
            planName: "Pro",
            cost: 100,
            description: "Plan Pro",
            list: ["Plan Pro", "Lorem", "Lorem"],
            button: {
              content: "Zacznij teraz",
              variant: "primary",
              url: "/signup",
            },
          },
          {
            planName: "Enterprise",
            cost: 1000,
            description: "Plan Enterprise",
            list: ["Plan Enterprise", "Lorem", "Lorem"],
            button: {
              content: "Zacznij teraz",
              variant: "primary",
              url: "/signup",
            },
          },
        ]}
      ></PricingColumns>
      <FAQSection
        header="Często zadawane pytania"
        description="Wszystko co musisz wiedzieć o Auxillium"
        faq={[
          {
            question: "Jak zacząć korzystać z systemu?",
            answer:
              "Wystarczy zarejestrować się na naszej platformie i wybrać plan darmowy, aby przetestować podstawowe funkcjonalności.",
          },
          {
            question: "Czy mogę zmienić plan w dowolnym momencie?",
            answer:
              "Tak, możesz przejść na wyższy lub niższy plan w dowolnym momencie. Zmiany wejdą w życie od kolejnego okresu rozliczeniowego.",
          },
          {
            question: "Jakie metody płatności są obsługiwane?",
            answer:
              "Obsługujemy płatności kartą, przelewy błyskawiczne oraz płatności cykliczne (subskrypcje).",
          },
        ]}
      />

      <CTA
        content="Gotowy na zmianę?"
        description="Zacznij korzystać z Auxillium już dziś i przekonaj się, jak łatwe może być zarządzanie Twoim biznesem."
        button={{
          content: "Zacznij teraz",
          variant: "primary",
          url: "/signup",
        }}
      ></CTA>
    </>
  );
}
