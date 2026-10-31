/** A few soft drifting clouds for the top of a page. Purely decorative. */
export function SkyClouds() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="cloud cloud-drift absolute -left-16 top-6 h-24 w-64 opacity-70" />
      <div className="cloud cloud-drift absolute left-[42%] -top-6 h-20 w-52 opacity-50 [animation-delay:-3s]" />
      <div className="cloud cloud-drift absolute -right-12 top-16 h-28 w-72 opacity-70 [animation-delay:-6s]" />
    </div>
  );
}
