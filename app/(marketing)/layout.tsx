import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import CookieBanner from "../components/CookieBanner/CookieBaner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <CookieBanner />
      <Footer />
    </>
  );
}
