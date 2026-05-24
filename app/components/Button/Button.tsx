import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  className?: string;
  content: string;
  variant: "primary" | "secondary";
  url: string;
  showArrow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  icon?: React.ReactNode;
}

export default function Button({ className, content, variant, url, showArrow, onClick, icon }: ButtonProps) {
  return (
    <>
      <Link
        onClick={onClick}
        href={url || "#"}
        className={`${className} ${variant === "primary" ? "primaryButton" : "secondaryButton"} flex items-center justify-center gap-2 group`}
      > 
        {icon && <span className="flex items-center">{icon}</span>}
        {content}
        {showArrow && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
      </Link>
    </>
  );
}
