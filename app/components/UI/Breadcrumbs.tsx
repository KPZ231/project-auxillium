"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  const { customLabel } = useBreadcrumb();

  // If no items provided, generate from pathname
  const generateItems = () => {
    const paths = pathname.split("/").filter((path) => path !== "");
    const breadcrumbs: BreadcrumbItem[] = paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      
      // Format label: capitalize and replace dashes with spaces
      let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      
      // Special cases
      if (label.toLowerCase() === "dashboard") label = "Dashboard";
      
      // If it's the last item and we have a customLabel, use it
      if (index === paths.length - 1 && customLabel) {
        label = customLabel;
      }

      return {
        label,
        href,
        active: index === paths.length - 1,
      };
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateItems();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[11px] font-medium tracking-wider uppercase text-gray-400">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/dashboard" className="hover:text-black transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1" />
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <li className="flex items-center">
              <ChevronRight className="w-3 h-3 mx-1 text-gray-300" />
            </li>
            <li>
              {item.active ? (
                <span className="text-black font-bold truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
