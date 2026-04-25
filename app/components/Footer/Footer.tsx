import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const navLinks = [
    { name: "PRYWATNOŚĆ", url: "/privacy" },
    { name: "REGULAMIN", url: "/regulations" },
    { name: "COOKIES", url: "/cookies" },
  ];

  return (
    <footer className="w-full bg-(--secondary) text-(--primary) border-t border-(--tetriary) mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-32 flex items-center justify-between">
        {/* Brand */}
        <div className="flex-1">
          <Image
            src="/images/auxillium-logo-3.png"
            alt="Auxillium Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Links */}
        <div className="flex-1 flex justify-center gap-8 md:gap-12">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.url}
              className={`text-[11px] font-bold tracking-[0.2em] hover:text-(--neutral) transition-colors ${
                index === 0 ? "underline underline-offset-4 decoration-2" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex-1 flex justify-end">
          <p className="text-[10px] md:text-[11px] font-medium tracking-wider text-(--neutral) uppercase">
            © 2024 AUXILLIUM. SYSTEM ZARZĄDZANIA.
          </p>
        </div>
      </div>
    </footer>
  );
}
