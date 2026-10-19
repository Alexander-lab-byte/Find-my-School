"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isClientNavigation, markHydrated, markRootRender, revealPage } from "@/lib/page-motion";

/*
 * Every page except the homepage enters with a soft "blur into focus":
 *  - on client navigation, the first visible elements come into focus one
 *    after another (see revealPage);
 *  - on a fresh page load, the page as a whole fades out of a light blur
 *    (pure CSS, so it plays before JavaScript loads).
 * The homepage keeps its own scroll animation. Reduced motion turns it off.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [stagger] = useState(isClientNavigation);
  markRootRender();

  useLayoutEffect(() => {
    if (stagger && ref.current) revealPage(ref.current);
    markHydrated();
  }, [stagger]);

  if (pathname === "/") return children;

  return (
    <div ref={ref} className={`${stagger ? "" : "fx-focus "}flex flex-1 flex-col`}>
      {children}
    </div>
  );
}
