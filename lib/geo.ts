/**
 * Small distance helpers for "near me". No database extension needed: there
 * are few enough schools to measure every one in memory.
 */

export type LatLng = { lat: number; lng: number };

/**
 * Locations travel in the URL as "47.92,106.91". We keep only 2 decimals
 * (about 1 km) so a shared link never gives away someone's exact home.
 */
export function roundLocation({ lat, lng }: LatLng): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

/** "47.92,106.91" → { lat, lng }, or undefined for anything malformed. */
export function parseNear(value: string | string[] | undefined): LatLng | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const [latText, lngText] = raw.split(",");
  const lat = Number.parseFloat(latText ?? "");
  const lng = Number.parseFloat(lngText ?? "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { lat, lng };
}

/** Straight-line ("as the crow flies") distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distance from `origin` to a school, or null when the school has no pin yet. */
export function schoolDistance(
  origin: LatLng | undefined,
  school: { latitude: number | null; longitude: number | null }
): number | null {
  if (!origin || school.latitude == null || school.longitude == null) return null;
  return distanceKm(origin, { lat: school.latitude, lng: school.longitude });
}
