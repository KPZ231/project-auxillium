"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../Button/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MdAccountCircle, MdLanguage } from "react-icons/md";
import { Menu, X } from "lucide-react";
import { useTranslation } from "@/app/context/TranslationContext";
import { useUser } from "@/app/context/UserContext";
import { usePathname } from "next/navigation";
import { supportedLanguages, Language } from "@/lib/i18n-config";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const { user } = useUser();
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
      <nav className="max-w-7xl mx-auto flex items-center justify-between border border-zinc-200 bg-(--secondary) px-6 py-4 transition-all duration-200 relative">
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

        {/* Navigation - Desktop */}
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

        {/* Buttons & Language - Desktop */}
        <div className="hidden md:flex items-center gap-6">
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

        {/* Hamburger Toggle - Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-700 hover:text-black focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Drawer */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-x border-b border-zinc-200 py-6 px-6 flex flex-col gap-6 md:hidden z-45">
            <div className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={`/${language}${link.url}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-700 hover:text-black py-2 border-b border-zinc-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Language Switcher - Mobile */}
            <div className="flex items-center gap-2 py-2">
              <MdLanguage className="text-zinc-500 w-5 h-5" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Language:</span>
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

            {/* Auth Actions - Mobile */}
            <div className="flex flex-col gap-3 pt-2">
              {user == null ? (
                <>
                  <Button 
                    content={t("common:buttons.log_in")} 
                    variant="secondary" 
                    url={`/${language}/login`}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center"
                  />
                  <Button 
                    content={t("common:buttons.sign_up")} 
                    variant="primary" 
                    url={`/${language}/register`}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center"
                  />
                </>
              ) : (
                <Button 
                  content={t("common:buttons.dashboard")} 
                  variant="secondary" 
                  url={`/${language}/dashboard`}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center"
                />
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
