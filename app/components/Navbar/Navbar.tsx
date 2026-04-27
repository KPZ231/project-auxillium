"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "../Button/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { useUser } from "@/app/context/UserContext";
import { MdAccountCircle } from "react-icons/md";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const { user } = useUser();

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
    };
  }, []);

  const navLinks = [
    { name: "About", url: "/about" },
    { name: "Pricing", url: "/pricing" },
    { name: "Contact", url: "/contact" },
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
              href={link.url}
              className="text-sm uppercase tracking-[0.15em] text-zinc-700 hover:text-black transition-colors duration-200 relative group"
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-px bg-black transition-all duration-200 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {
            user == null ? (
              <>
                <Button content="Log In" variant="secondary" url="/login" />
                <Button content="Sign Up" variant="primary" url="/register" />
              </>
            ) : (
              <div className="flex items-center gap-2">               
                <Button content="Dashboard" variant="secondary" url="/dashboard" />
              </div>
            )
          }
        </div>
      </nav>
    </header>
  );
}
