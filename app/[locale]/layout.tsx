import { Metadata } from "next";
import { Inter, Anonymous_Pro } from "next/font/google";
import { Toaster } from "sonner";
import { UserProvider } from "@/app/context/UserContext";
import { TranslationProvider } from "@/app/context/TranslationContext";
import Navbar from "@/app/components/Navbar/Navbar";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
});

const anonymus_pro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--anonymus-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auxillium",
  description: "Business management platform",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html
      lang={locale}
      className={`${inter.className} ${anonymus_pro.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <TranslationProvider initialLanguage={locale as any}>
          <UserProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </UserProvider>
        </TranslationProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
