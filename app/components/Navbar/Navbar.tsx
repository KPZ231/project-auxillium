"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../Button/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdAccountCircle, MdLanguage } from "react-icons/md";
import { useTranslation } from "@/app/context/TranslationContext";
import { useUser } from "@/app/context/UserContext";
import { usePathname } from "next/navigation";
import { supportedLanguages, Language } from "@/lib/i18n-config";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const { user } = useUser();
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!headerRef.current) return;

    const showAnim = gsap
      .from(headerRef.current, {
        yPercent: -100,
        paused: true,
        duration: 0.2,
      })
      .progress(1);

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }
      },
    });

    return () => {
      trigger.kill();
      showAnim.kill();
    };
  }, []);

  const getPathWithoutLocale = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0 && supportedLanguages.includes(segments[0] as Language)) {
      return "/" + segments.slice(1).join("/");
    }
    return path;
  };

  const currentPathWithoutLocale = getPathWithoutLocale(pathname);

  const navLinks = [
    { name: t("common:buttons.about"), url: "/about" },
    { name: t("common:buttons.pricing"), url: "/pricing" },
    { name: t("common:buttons.contact"), url: "/contact" },
  ];

  return (
    <header 
      ref={headerRef} 
      className="header fixed top-0 left-0 w-full px-6 lg:px-12 pt-6 z-50"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between border border-zinc-200 bg-(--secondary)  px-6 py-4 transition-all duration-200">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <Image
            src="/images/auxillium-logo-3.png"
            alt="Auxillium Logo"
            title="Auxillium Logo"
            width={110}
            height={110}
            priority
            className="object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={`/${language}${link.url}`}
              className="text-sm uppercase tracking-[0.15em] text-zinc-700 hover:text-black transition-colors duration-200 relative group"
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Buttons & Language */}
        <div className="flex items-center gap-6">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 border-r border-zinc-200 pr-4">
            <MdLanguage className="text-zinc-500 w-5 h-5" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as Language;
                setLanguage(newLang);
                window.location.pathname = `/${newLang}${currentPathWithoutLocale}`;
              }}
              className="bg-transparent text-xs font-bold tracking-widest uppercase cursor-pointer focus:outline-none"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {user == null ? (
              <>
                <Button 
                  content={t("common:buttons.log_in")} 
                  variant="secondary" 
                  url={`/${language}/login`} 
                />
                <Button 
                  content={t("common:buttons.sign_up")} 
                  variant="primary" 
                  url={`/${language}/register`} 
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  content={t("common:buttons.dashboard")} 
                  variant="secondary" 
                  url={`/${language}/dashboard`} 
                />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
