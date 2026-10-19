"use client";

import { usePathname } from "next/navigation";
import { markRootRender } from "@/lib/page-motion";

/*
 * Every page except the homepage opens with a short paper-like effect:
 *  - the map unfolds like a folded paper map,
 *  - everything else swings open like a book cover from its spine.
 * The homepage keeps its own scroll animation. Reduced-motion visitors get
 * no movement (see the media query in globals.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  markRootRender();

  if (pathname === "/") return children;

  const effect = pathname.startsWith("/map") ? "fx-unfold" : "fx-book";
  return <div className={`${effect} flex flex-1 flex-col`}>{children}</div>;
}
