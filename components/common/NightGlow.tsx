/**
 * Decorative top-of-page backdrop: a faint grid of city lights fading into
 * the night, with a soft amber and ice glow. Matches the homepage 3D city.
 */
export function NightGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgb(143 180 255 / 0.55) 0 1px, transparent 1.5px), radial-gradient(circle at center, rgb(255 181 71 / 0.7) 0 1px, transparent 1.6px)",
          backgroundSize: "22px 22px, 86px 64px",
          backgroundPosition: "0 0, 11px 7px",
          maskImage: "radial-gradient(70% 90% at 70% 0%, #000 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(70% 90% at 70% 0%, #000 0%, transparent 75%)",
        }}
      />
      <div className="absolute -right-24 -top-40 size-[520px] rounded-full bg-ice/10 blur-3xl" />
      <div className="absolute -left-32 -top-24 size-[420px] rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}
