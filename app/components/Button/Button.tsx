import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  className?: string;
  content: string;
  variant: "primary" | "secondary";
  url: string;
  showArrow?: boolean;
}

export default function Button({ className, content, variant, url, showArrow }: ButtonProps) {
  return (
    <>
      <Link
        href={url}
        className={`${className} ${variant === "primary" ? "primaryButton" : "secondaryButton"} flex items-center gap-2 group`}
      > 
        {content}
        {showArrow && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
      </Link>
    </>
  );
}
