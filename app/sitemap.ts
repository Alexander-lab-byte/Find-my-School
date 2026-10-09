import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";

// Rebuilt at most hourly; schools change rarely.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const schools = await prisma.school.findMany({ select: { id: true, updatedAt: true } });

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...schools.flatMap((school) =>
      ["", "/reviews"].map((tab) => ({
        url: `${base}/school/${school.id}${tab}`,
        lastModified: school.updatedAt,
        changeFrequency: "weekly" as const,
        priority: tab ? 0.6 : 0.7,
      }))
    ),
  ];
}
