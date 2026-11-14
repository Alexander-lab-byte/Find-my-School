/**
 * The site's one map: the standalone page at /embed/map.html (MapLibre, vector
 * tiles, school photos, type filters), shown in a frame. The same file can be
 * embedded on other websites; `site=1` tells it that it is inside our own pages.
 *
 * It loads only when it is about to scroll into view (`loading="lazy"`), so
 * pages that show a map far down don't pay for it up front.
 */
export function SchoolsMapFrame({
  locale,
  title,
  schoolId,
  className = "",
}: {
  locale: string;
  /** Read by screen readers as the frame's name. */
  title: string;
  /** Centres the map on one school and rings it, with no filter bar (for a school's own page). */
  schoolId?: string;
  /** Sets the height, e.g. "h-[440px]". */
  className?: string;
}) {
  const params = new URLSearchParams({ site: "1", lang: locale === "mn" ? "mn" : "en" });
  if (schoolId) {
    params.set("school", schoolId);
    params.set("ui", "min");
  }
  return (
    <iframe
      src={`/embed/map.html?${params}`}
      title={title}
      loading="lazy"
      allow="geolocation"
      className={`block w-full rounded-2xl border border-line bg-surface-muted ${className}`}
    />
  );
}
