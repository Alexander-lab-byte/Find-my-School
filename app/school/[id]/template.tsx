"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { revealPage, rootJustRendered } from "@/lib/page-motion";

/*
 * Switching tabs on a school profile (Overview, Reviews, Admissions…) brings
 * the new tab's content into focus the same way pages enter. Skipped when the
 * whole page has just opened, since the root template is already animating.
 */
export default function SchoolTabTemplate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate] = useState(() => !rootJustRendered());

  useLayoutEffect(() => {
    if (animate && ref.current) revealPage(ref.current);
  }, [animate]);

  return <div ref={ref}>{children}</div>;
}
