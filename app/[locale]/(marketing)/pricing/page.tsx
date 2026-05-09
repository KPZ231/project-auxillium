import VideoPlayer from "@/app/components/VideoPlayer/VideoPlayer";
import PricingColumns from "@/app/components/Pricing/PricingColumns";
import CTA from "@/app/components/CTA/CTA";
import HeroSection from "@/app/components/HeroSection/HeroSection";

export default function Pricing() {
  return (
    <>
      <HeroSection
        header="Cennik"
        description="Sprawdź nasze plany"
        image={{
          src: "/images/background-image-4.jpeg",
          alt: "Hero Image",
          width: 450,
          height: 450,
        }}
        button={{
          content: "Zacznij teraz",
          variant: "primary",
          url: "/signup",
        }}
      ></HeroSection>
      <VideoPlayer src="/videos/pricing.mov"></VideoPlayer>
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
