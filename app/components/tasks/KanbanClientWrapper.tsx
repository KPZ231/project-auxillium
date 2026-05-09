"use client";

import dynamic from "next/dynamic";

// This wrapper allows us to use { ssr: false } which is required 
// to avoid createContext errors from dnd/motion libraries on the server.
export const KanbanClientWrapper = dynamic(
  () => import("./KanbanContainer").then(mod => mod.KanbanContainer),
  { ssr: false }
);
