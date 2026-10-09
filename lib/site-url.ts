/**
 * The public site origin, for absolute URLs (sitemap, robots). Set
 * NEXT_PUBLIC_SITE_URL to the real domain; on Vercel the production URL is
 * used automatically.
 */
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
