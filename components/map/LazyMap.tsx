"use client";

import { useEffect, useRef, useState } from "react";
import { SchoolMap } from "@/components/map/SchoolMap";
import type { LeafletMapProps } from "@/components/map/LeafletMap";

/**
 * A map that only loads (Leaflet's script, then the tiles) once it is about
 * to scroll into view. Until then it is an empty box of the same size, so
 * pages that show a map far down don't pay for it up front.
 */
export function LazyMap(props: LeafletMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? (
        <SchoolMap {...props} />
      ) : (
        <div className="rounded-2xl border border-line bg-surface-muted" style={{ height: props.height }} />
      )}
    </div>
  );
}
