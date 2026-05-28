'use client'
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/app/context/TranslationContext";

export default function Footer() {
  const { t } = useTranslation();
  const year: number = new Date().getFullYear();
  const pathname = usePathname();

  const navLinks = [
    { name: t("common:nav.privacy"), url: "/privacy" },
    { name: t("common:nav.terms"), url: "/terms" },
    { name: t("common:nav.cookies"), url: "/cookies" },
  ];

  return (
    <footer className="w-full bg-[#0A0A0A] text-[#FAFAFA] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Main footer body */}
        <div className="py-12 md:py-16 flex flex-col md:flex-row md:items-start justify-between gap-10 md:gap-0">

          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Image
              src="/images/auxillium-logo-3.png"
              alt="Auxillium Logo"
              width={110}
              height={36}
              className="object-contain brightness-0 invert opacity-90"
            />
            <p className="font-['IBM_Plex_Mono'] text-[11px] tracking-[0.18em] text-[#71717A] uppercase">
              {t("common:footer.tagline")}
            </p>
          </div>

          {/* Nav links column */}
          <nav className="flex flex-col gap-3 md:items-end">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.url}
                className={`text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-150 ${
                  pathname === link.url
                    ? "text-[#FAFAFA]"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#FAFAFA]/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.15em] text-[#3F3F46] uppercase">
            © {year} Auxillium
          </p>
          <p className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.12em] text-[#3F3F46] uppercase">
            All rights reserved
          </p>
        </div>

      </div>
    </footer>
  );
}
