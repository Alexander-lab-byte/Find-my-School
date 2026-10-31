/**
 * Page entrance motion, in the style of modern WebGL/landing sites:
 * the page's first visible elements come into focus one after another
 * (blur → sharp, a small rise), headings slightly stronger than the rest.
 *
 * It uses the Web Animations API, so it never touches the classes or styles
 * React owns, and with fill "backwards" nothing is left behind afterwards.
 */

let hydrated = false;
let rootRenderedAt = -Infinity;

/** True once the app has hydrated, i.e. this is a client-side navigation. */
export function isClientNavigation() {
  return hydrated;
}

export function markHydrated() {
  hydrated = true;
}

/** The root template stamps this so a nested template can avoid stacking effects. */
export function markRootRender() {
  rootRenderedAt = now();
}

export function rootJustRendered() {
  return now() - rootRenderedAt < 120;
}

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

// Things worth revealing one by one. Nested matches are skipped so a card and
// its own paragraph don't both move.
const ITEMS = "h1, h2, h3, p, form, article, table, ul, ol, [role='search'], .glass, .chip, .btn-primary, .btn-secondary, section > div";
const MAX_ITEMS = 14;
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export function revealPage(root: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof root.animate !== "function") return;

  const viewport = window.innerHeight;
  const picked: HTMLElement[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(ITEMS)) {
    if (picked.length >= MAX_ITEMS) break;
    if (picked.some((p) => p.contains(el))) continue;
    const r = el.getBoundingClientRect();
    if (r.height === 0 || r.top > viewport || r.bottom < 0) continue;
    picked.push(el);
  }

  picked.forEach((el, i) => {
    const heading = /^H[12]$/.test(el.tagName);
    el.animate(
      [
        {
          opacity: 0,
          filter: `blur(${heading ? 14 : 8}px)`,
          transform: `translateY(${heading ? 26 : 14}px)${heading ? " scale(0.985)" : ""}`,
        },
        { opacity: 1, filter: "blur(0px)", transform: "none" },
      ],
      { duration: heading ? 900 : 700, delay: 40 + i * 55, easing: EASE, fill: "backwards" },
    );
  });
}
