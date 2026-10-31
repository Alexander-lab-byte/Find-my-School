"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import { useLocale, useTranslations } from "next-intl";
import type { SchoolType } from "@prisma/client";
import { formatLocation, schoolNames } from "@/lib/labels";

export type MapPoint = {
  id: string;
  nameEn: string;
  nameMn: string | null;
  type: SchoolType;
  district: string | null;
  khoroo: string | null;
  aimagCity: string;
  address: string | null;
  latitude: number;
  longitude: number;
  locationApproximate: boolean;
};

export type LeafletMapProps = {
  schools: MapPoint[];
  /** Pixel height of the map. */
  height: number;
  /** Allow scroll-wheel zoom (off for maps embedded in a scrolling page). */
  scrollZoom?: boolean;
  /** Highlighted school: its pin grows and its popup opens. */
  selectedId?: string | null;
  /** Called when a pin is clicked. */
  onSelect?: (id: string) => void;
};

const UB_CENTER: [number, number] = [47.9077, 106.9172];

// OpenStreetMap's standard tiles: free, no API key, attribution required.
// globals.css mutes their colours (and inverts them in dark mode) so the
// map stays calm next to the rest of the site. Fine for this site's
// traffic; switch to a hosted tile service (e.g. MapTiler, Stadia) with a
// key if usage grows — see https://operations.osmfoundation.org/policies/tiles/
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// One icon per type × precision; Leaflet icons are plain HTML, styled in globals.css.
const icons = new Map<string, ReturnType<typeof divIcon>>();
function pinIcon(type: SchoolType, approximate: boolean, selected = false) {
  const key = `${type}-${approximate}-${selected}`;
  let icon = icons.get(key);
  if (!icon) {
    icon = divIcon({
      className: "",
      html: `<span class="school-pin school-pin--${type.toLowerCase()}${
        approximate ? " school-pin--approximate" : ""
      }${selected ? " school-pin--selected" : ""}"><span></span></span>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });
    icons.set(key, icon);
  }
  return icon;
}

/** Pans to the selected school and opens its popup. */
function FocusSelected({
  selectedId,
  schools,
  markers,
}: {
  selectedId?: string | null;
  schools: MapPoint[];
  markers: React.RefObject<Map<string, LeafletMarker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const school = schools.find((s) => s.id === selectedId);
    if (!school) return;
    map.flyTo([school.latitude, school.longitude], Math.max(map.getZoom(), 14), { duration: 0.6 });
    markers.current.get(selectedId)?.openPopup();
  }, [selectedId, schools, map, markers]);
  return null;
}

export default function LeafletMap({
  schools,
  height,
  scrollZoom = false,
  selectedId,
  onSelect,
}: LeafletMapProps) {
  const markers = useRef(new Map<string, LeafletMarker>());
  const t = useTranslations("Map");
  const tType = useTranslations("SchoolType");
  const tPlace = useTranslations("Place");
  const locale = useLocale();

  const bounds = useMemo(
    () =>
      schools.length > 1
        ? latLngBounds(schools.map((s) => [s.latitude, s.longitude] as [number, number])).pad(0.15)
        : undefined,
    [schools]
  );
  const single = schools.length === 1 ? schools[0] : null;

  return (
    <MapContainer
      bounds={bounds}
      center={single ? [single.latitude, single.longitude] : bounds ? undefined : UB_CENTER}
      zoom={single ? 15 : bounds ? undefined : 12}
      scrollWheelZoom={scrollZoom}
      style={{ height }}
      className="school-map z-0 w-full"
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <FocusSelected selectedId={selectedId} schools={schools} markers={markers} />
      {schools.map((school) => {
        const { primary, secondary } = schoolNames(school, locale);
        return (
          <Marker
            key={school.id}
            position={[school.latitude, school.longitude]}
            icon={pinIcon(school.type, school.locationApproximate, school.id === selectedId)}
            zIndexOffset={school.id === selectedId ? 1000 : 0}
            title={primary}
            alt={primary}
            ref={(marker) => {
              if (marker) markers.current.set(school.id, marker);
              else markers.current.delete(school.id);
            }}
            eventHandlers={onSelect ? { click: () => onSelect(school.id) } : undefined}
          >
            <Popup>
              <div className="min-w-48 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {tType(school.type)}
                </p>
                <p className="font-display text-base font-bold leading-snug text-foreground">
                  {primary}
                </p>
                {secondary && <p className="text-xs text-muted">{secondary}</p>}
                <p className="text-xs text-muted">
                  {[school.address, formatLocation(tPlace, school)].filter(Boolean).join(", ")}
                </p>
                {school.locationApproximate && (
                  <p className="text-xs font-medium text-star">{t("approximate")}</p>
                )}
                {!single && (
                  <Link
                    href={`/school/${school.id}`}
                    className="inline-block pt-1 text-sm font-medium text-accent hover:underline"
                  >
                    {t("viewProfile")} →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
