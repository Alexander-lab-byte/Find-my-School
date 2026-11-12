import { prisma } from "@/lib/prisma";
import { SCHOOL_PHOTOS } from "@/lib/school-photos";

/**
 * Every school with a map pin, as GeoJSON — the format map libraries
 * (MapLibre, Leaflet, Mapbox, Google Maps data layers) read directly.
 *
 * Public on purpose: our embeddable map (/embed/map.html) and other websites
 * use it. CORS is open, and the CDN caches it for an hour.
 *
 *   GET /api/map/schools
 *   GET /api/map/schools?type=PUBLIC        (PUBLIC | PRIVATE | INTERNATIONAL)
 */

const TYPES = new Set(["PUBLIC", "PRIVATE", "INTERNATIONAL"]);

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type")?.toUpperCase();

  const schools = await prisma.school.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      ...(type && TYPES.has(type) ? { type: type as "PUBLIC" | "PRIVATE" | "INTERNATIONAL" } : {}),
    },
    select: {
      id: true,
      nameEn: true,
      nameMn: true,
      type: true,
      level: true,
      district: true,
      khoroo: true,
      address: true,
      latitude: true,
      longitude: true,
      locationApproximate: true,
      tuitionMinAnnual: true,
      tuitionMaxAnnual: true,
      avgOverall: true,
      reviewCount: true,
      website: true,
      phone: true,
    },
    orderBy: { nameEn: "asc" },
  });

  const origin = new URL(request.url).origin;

  const features = schools.map((s) => {
    const photo = SCHOOL_PHOTOS[s.nameEn] ?? null;
    return {
      type: "Feature" as const,
      id: s.id,
      geometry: { type: "Point" as const, coordinates: [s.longitude, s.latitude] },
      properties: {
        id: s.id,
        nameEn: s.nameEn,
        nameMn: s.nameMn,
        type: s.type,
        level: s.level,
        district: s.district,
        khoroo: s.khoroo,
        address: s.address,
        locationApproximate: s.locationApproximate,
        tuitionMinAnnual: s.tuitionMinAnnual,
        tuitionMaxAnnual: s.tuitionMaxAnnual,
        rating: s.reviewCount > 0 ? s.avgOverall : null,
        reviewCount: s.reviewCount,
        website: s.website,
        phone: s.phone,
        url: `${origin}/school/${s.id}`,
        // Free-licensed photo (Wikimedia Commons). Show the credit next to it.
        photoUrl: photo?.url ?? null,
        photoCredit: photo ? `${photo.author} · ${photo.license}` : null,
        photoSource: photo?.page ?? null,
      },
    };
  });

  return Response.json(
    {
      type: "FeatureCollection",
      attribution:
        "Find My School Mongolia. Locations © OpenStreetMap contributors (ODbL). Photos from Wikimedia Commons, credited per photo.",
      features,
    },
    { headers: HEADERS }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: HEADERS });
}
