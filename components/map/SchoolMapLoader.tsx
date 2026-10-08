"use client";

import dynamic from "next/dynamic";
import type { MapSchool } from "@/components/map/SchoolMap";

// Leaflet touches `window` as soon as it loads, so it can't render on the server.
const SchoolMap = dynamic(() => import("@/components/map/SchoolMap").then((m) => m.SchoolMap), {
  ssr: false,
  loading: () => <div className="h-[70vh] animate-pulse rounded-xl bg-surface-muted" />,
});

export function SchoolMapLoader({ schools }: { schools: MapSchool[] }) {
  return <SchoolMap schools={schools} />;
}
