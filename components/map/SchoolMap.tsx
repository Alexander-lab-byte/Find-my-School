"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { SchoolLevel, SchoolType } from "@prisma/client";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { LEVEL_LABELS, TYPE_LABELS } from "@/lib/labels";

export type MapSchool = {
  id: string;
  nameEn: string;
  nameMn: string;
  type: SchoolType;
  level: SchoolLevel;
  district: string | null;
  avgOverall: number | null;
  reviewCount: number;
  latitude: number;
  longitude: number;
};

// Same hues as the type badges on the cards.
const TYPE_COLORS: Record<SchoolType, string> = {
  PUBLIC: "#2f5a66",
  PRIVATE: "#a4552f",
  INTERNATIONAL: "#5b4fa8",
};

// Ulaanbaatar city centre.
const DEFAULT_CENTER: [number, number] = [47.9184, 106.9177];

export function SchoolMap({ schools }: { schools: MapSchool[] }) {
  return (
    <div>
      {/* isolate keeps Leaflet's high z-indexes from covering the site header and menus */}
      <div className="isolate overflow-hidden rounded-xl border border-line">
        <MapContainer center={DEFAULT_CENTER} zoom={11} className="h-[70vh] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {schools.map((school) => (
            <CircleMarker
              key={school.id}
              center={[school.latitude, school.longitude]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: TYPE_COLORS[school.type],
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{school.nameEn}</p>
                  <p className="text-zinc-500">{school.nameMn}</p>
                  <p className="text-zinc-500">
                    {TYPE_LABELS[school.type]} · {LEVEL_LABELS[school.level]}
                    {school.district ? ` · ${school.district}` : ""}
                  </p>
                  <p>
                    {school.avgOverall
                      ? `★ ${school.avgOverall.toFixed(1)} (${school.reviewCount})`
                      : "No ratings yet"}
                  </p>
                  <Link href={`/school/${school.id}`} className="text-accent underline">
                    View school
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {(Object.keys(TYPE_COLORS) as SchoolType[]).map((type) => (
          <li key={type} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            />
            {TYPE_LABELS[type]}
          </li>
        ))}
      </ul>
    </div>
  );
}
