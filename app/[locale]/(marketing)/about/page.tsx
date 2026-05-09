import HeroSection from "@/app/components/HeroSection/HeroSection";
import Grid from "@/app/components/Grid/Grid";
import BigQuotation from "@/app/components/Testimonial/BigQuotation";

const data = {
  header: "O nas",
  description: "Dowiedz się więcej o naszej firmie",
  image: {
    src: "/images/background-image.jpeg",
    alt: "Hero Image",
    width: 450,
    height: 450,
  },
  button: {
    content: "Zacznij teraz",
    variant: "primary",
    url: "/signup",
  },
  grid: {
    title: "Co oferujemy",
    subtitle:
      "Jako KPZ's Productions oferujemy szeroki zakres usług związanych z tworzeniem oprogramowania. Nasz zespół składa się z doświadczonych programistów i projektantów, którzy są w stanie sprostać nawet najbardziej wymagającym zadaniom.",
    cards: [
      {
        header: "Nowe technologie",
        content: "Nowe technologie",
      },
      {
        header: "Nowe technologie",
        content: "Nowe technologie",
      },
      {
        header: "Nowe technologie",
        content: "Nowe technologie",
      },
      {
        header: "Nowe technologie",
        content: "Nowe technologie",
      },
    ],
  },
  bigQuotation: {
    title: "Co nas wyróżnia",
    quoteContent: "Pomagamy firmom transformować cyfrowo i skalować biznes",
    subContent:
      "Łączymy kreatywność z danymi. Tworzymy oprogramowanie, które napędza wzrost, zwiększa wydajność i otwiera nowe możliwości rynkowe dla naszych klientów.",
  },
} as const;

export default function About() {
  return (
    <>
      <HeroSection
        header={data.header}
        description={data.description}
        image={data.image}
        button={data.button}
      ></HeroSection>
      <Grid
        title={data.grid.title}
        subtitle={data.grid.subtitle}
        cards={data.grid.cards}
      ></Grid>
      <BigQuotation
        title={data.bigQuotation.title}
        quoteContent={data.bigQuotation.quoteContent}
        subContent={data.bigQuotation.subContent}
      ></BigQuotation>
    </>
  );
}
