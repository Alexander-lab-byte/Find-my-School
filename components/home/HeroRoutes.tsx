/**
 * The faint route map behind the homepage hero: three lines with stops,
 * drawn one shade lighter than the navy band and faded out behind the
 * heading so it never competes with the text. Decoration only.
 */
export function HeroRoutes() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(100deg,transparent_8%,rgb(0_0_0/0.3)_40%,black_62%)]"
      fill="none"
      stroke="var(--band-line)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M-20 96H330l150 150h420l150-150h410" />
      <path d="M-20 452h250l130-130h390l150 150h560" />
      <path d="M640-20v130l150 150v320" opacity="0.6" />
      <g fill="var(--band)" strokeWidth="6">
        <circle cx="180" cy="96" r="10" />
        <circle cx="480" cy="246" r="10" />
        <circle cx="790" cy="260" r="10" />
        <circle cx="1050" cy="96" r="10" />
        <circle cx="1290" cy="96" r="10" />
        <circle cx="360" cy="322" r="10" />
        <circle cx="900" cy="472" r="10" />
        <circle cx="1200" cy="472" r="10" />
      </g>
    </svg>
  );
}
