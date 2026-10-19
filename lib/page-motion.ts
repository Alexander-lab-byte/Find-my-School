/**
 * Shared clock for the page-open animations.
 *
 * The root template (book opening / map unfolding) and the school-profile
 * template (page turn) can both mount on the same navigation, e.g. going from
 * /search to /school/abc. The root template stamps the time it rendered, and
 * the school template skips its own effect if the root just opened the page,
 * so a visitor sees one animation, not two stacked.
 */
let rootRenderedAt = -Infinity;

export function markRootRender() {
  rootRenderedAt = now();
}

export function rootJustRendered() {
  return now() - rootRenderedAt < 120;
}

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
