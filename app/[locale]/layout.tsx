import { Metadata } from "next";
import { Inter, Anonymous_Pro } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from '@vercel/analytics/react';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const seoData: Record<string, { title: string; description: string }> = {
    pl: {
      title: "Auxilium | Kompleksowy system operacyjny dla MŚP",
      description: "Zakończ erę rozproszonych narzędzi. Auxilium to kompleksowy system operacyjny dla MŚP łączący CRM, projekty i finanse. Odzyskaj do 30% czasu pracy.",
    },
    en: {
      title: "Auxilium | All-in-One OS for SMEs",
      description: "End the era of scattered tools. Auxilium is a comprehensive operating system for SMEs combining CRM, projects, and finance. Reclaim up to 30% of your time.",
    },
    de: {
      title: "Auxilium | All-in-One Betriebssystem für KMU",
      description: "Beenden Sie die Ära der verstreuten Tools. Auxilium ist ein umfassendes Betriebssystem für KMU, das CRM, Projekte und Finanzen kombiniert.",
    }
  };

  const data = seoData[locale] || seoData.en;

  return {
    title: {
      default: data.title,
      template: "%s | Auxilium",
    },
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://auxilium.app/${locale}`,
      siteName: "Auxilium",
      images: [
        {
          url: "https://auxilium.app/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Auxilium - System operacyjny dla MŚP",
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: ["https://auxilium.app/og-image.jpg"],
    },
    alternates: {
      canonical: `https://auxilium.app/${locale}`,
      languages: {
        'pl': 'https://auxilium.app/pl',
        'en': 'https://auxilium.app/en',
        'de': 'https://auxilium.app/de',
        'x-default': 'https://auxilium.app/en',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

const getResources = async (locale: string) => {
  const namespaces = ['common', 'dashboard', 'forms', 'marketing', 'documents'];
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
  
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://auxilium.site/#organization",
        "name": "Auxilium",
        "url": "https://auxilium.site",
        "logo": "https://auxilium.site/images/auxillium-logo-2.png",
        "sameAs": [
          "https://linkedin.com/company/auxilium",
          "https://twitter.com/auxiliumapp"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://auxilium.site/#software",
        "name": "Auxilium",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PLN"
        },
        "publisher": {
          "@id": "https://auxilium.site/#organization"
        }
      }
    ]
  };

  return (
    <html
      lang={locale}
      className={`${inter.className} ${anonymus_pro.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TranslationProvider initialLanguage={locale as "pl" | "en" | "de"} resources={resources as Record<string, Record<string, string>>}>
          <UserProvider>
            <BetaAnnoucementBar />
            <main className="flex-1">{children}</main>
          </UserProvider>
        </TranslationProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
