"use client";

import { useEffect } from "react";

/**
 * Feeds the pointer position into any `.holo` card under it (as --mx / --my),
 * so the amber light on cards follows the cursor. One listener for the page.
 */
export function HoloTracker() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.(".holo") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
