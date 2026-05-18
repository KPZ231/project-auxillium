import { Metadata } from "next";
import { Inter, Anonymous_Pro } from "next/font/google";
import { Toaster } from "sonner";
import { promises as fs } from 'fs';
import path from 'path';
import { UserProvider } from "@/app/context/UserContext";
import { TranslationProvider } from "@/app/context/TranslationContext";
import BetaAnnoucementBar from "@/app/components/BetaAnnoucementBar/BetaAnnoucementBar";
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

const getResources = async (locale: string) => {
  const namespaces = ['common', 'dashboard', 'forms', 'marketing'];
  const resources: Record<string, unknown> = {};
  
  for (const ns of namespaces) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'locales', locale, `${ns}.json`);
      const fileContents = await fs.readFile(filePath, 'utf8');
      resources[ns] = JSON.parse(fileContents);
    } catch {
      // console.error(`Failed to load namespace ${ns} for locale ${locale}`);
    }
  }
  
  return {
    [locale]: resources
  };
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resources = await getResources(locale);
  
  return (
    <html
      lang={locale}
      className={`${inter.className} ${anonymus_pro.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <TranslationProvider initialLanguage={locale as "pl" | "en" | "de"} resources={resources as Record<string, Record<string, string>>}>
          <UserProvider>
            <BetaAnnoucementBar />
            <main className="flex-1">{children}</main>
          </UserProvider>
        </TranslationProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
