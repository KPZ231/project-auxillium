"use client";

import { usePathname } from "next/navigation";
import SidePanel from "./Dashboard/SidePanel/SidePanel";
import SpaceSidePanel from "./Space/SpaceSidePanel";

export default function SidePanelWrapper() {
  const pathname = usePathname();
  
  if (pathname.startsWith("/dashboard/space")) {
    return <SpaceSidePanel />;
  }
  
  return <SidePanel />;
}
