"use client";

import { usePathname } from "next/navigation";
import SidePanel from "./Dashboard/SidePanel/SidePanel";
import SpaceSidePanel from "./Space/SpaceSidePanel";

export default function SidePanelWrapper() {
  const pathname = usePathname();
  
  // Account for locale prefix (e.g. /en/dashboard/space)
  const isSpaceRoute = pathname.includes("/dashboard/space");
  
  if (isSpaceRoute) {
    return <SpaceSidePanel />;
  }
  
  return <SidePanel />;
}
