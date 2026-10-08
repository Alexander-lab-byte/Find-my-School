"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "@/components/map/LeafletMap";

export type { MapPoint } from "@/components/map/LeafletMap";

// Leaflet touches `window` as soon as it loads, so it only ever runs in the
// browser; a same-sized placeholder keeps the page from jumping meanwhile.
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => null,
});

export function SchoolMap(props: LeafletMapProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-line bg-surface-muted"
      style={{ height: props.height }}
    >
      <LeafletMap {...props} />
    </div>
  );
}
