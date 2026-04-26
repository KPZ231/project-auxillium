import HeroSection from "../components/HeroSection/HeroSection";
const data = {
  header: "O nas",
  description: "Dowiedz się więcej o naszej firmie",
  image: {
    src: "/images/heroImage.png",
    alt: "Hero Image",
    width: 450,
    height: 450,
  },
  button: {
    content: "Zacznij teraz",
    variant: "primary",
    url: "/signup",
  },
};

export default function About() {
  return (
    <>
      <HeroSection
        header={data.header}
        description={data.description}
        image={data.image}
        button={data.button}
      ></HeroSection>
    </>
  );
}
