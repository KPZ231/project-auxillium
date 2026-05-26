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
    <footer className="w-full bg-(--secondary) text-(--primary) border-t border-(--tetriary) mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 md:py-0 md:h-32 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
        {/* Brand */}
        <div className="flex-1 flex justify-center md:justify-start">
          <Image
            src="/images/auxillium-logo-3.png"
            alt="Auxillium Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-wrap justify-center gap-6 md:gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              className={`text-[11px] font-bold tracking-[0.2em] hover:text-(--neutral) transition-colors ${
                pathname === link.url ? "underline underline-offset-4 decoration-2" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex-1 flex justify-center md:justify-end text-center md:text-right">
          <p className="text-[10px] md:text-[11px] font-medium tracking-wider text-(--neutral) uppercase">
            © {year} AUXILLIUM. {t("common:footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
