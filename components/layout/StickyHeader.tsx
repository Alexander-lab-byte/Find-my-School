"use client";

import { useEffect, useState } from "react";

/**
 * The site header's shell. Light and see-through at the very top (so the
 * homepage sky shows), then a solid surface with a shadow once the page
 * scrolls, so the navigation stays readable over any content.
 */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-200 ${
        scrolled
          ? "border-line bg-surface shadow-[0_8px_24px_-16px_rgb(0_0_0/0.35)]"
          : "border-transparent bg-surface/80 backdrop-blur-xl backdrop-saturate-150"
      }`}
    >
      {children}
    </header>
  );
}
