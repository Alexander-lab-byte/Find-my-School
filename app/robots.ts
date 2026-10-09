import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and admin pages have nothing for search engines.
      disallow: ["/admin", "/profile", "/my-reviews", "/saved", "/compare", "/api", "/auth"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
