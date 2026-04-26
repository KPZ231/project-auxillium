import HeroSection from "../components/HeroSection/HeroSection";
import ContactForm from "../components/ContactForm/ContactForm";

export default function Contact() {
  return (
    <>
      <HeroSection
        header="Kontakt"
        description="Skontaktuj się z nami"
        image={{
          src: "/images/background-image-3.jpeg",
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
      <ContactForm />
    </>
  );
}
