// Groups free-text graduate destinations ("Harvard", "Японы их дээд сургуулиуд",
// "UK/US тэтгэлэгтүүд"…) into regions, so the homepage path can match schools
// to where a family hopes their child will study. Pure functions: safe on
// both the server and the client.

export const REGIONS = [
  "US",
  "UK",
  "Japan",
  "Korea",
  "China",
  "Australia",
  "Canada",
  "Europe",
  "Turkey",
  "Asia",
  "Mongolia",
] as const;

export type Region = (typeof REGIONS)[number];

// Lower-case fragments that identify a region. Checked against the whole
// destination text, so Mongolian case endings ("Японы", "Европын") still match.
const FRAGMENTS: [Region, string[]][] = [
  ["US", ["harvard", "stanford", "mit", "columbia", "nyu", "berkeley", "ucla", "caltech", "ivy", "princeton", "yale", "penn", "united states", "америк"]],
  ["UK", ["oxford", "cambridge", "imperial", "ucl", "king's", "kings college", "lse", "edinburgh", "britain", "england", "их британи", "англи"]],
  ["Japan", ["tokyo", "kyoto", "titech", "waseda", "keio", "osaka", "mext", "japan", "япон", "токио", "киото"]],
  ["Korea", ["korea", "seoul", "kaist", "yonsei", "солонгос"]],
  ["China", ["china", "tsinghua", "peking", "fudan", "хятад"]],
  ["Australia", ["sydney", "melbourne", "monash", "australia", "австрали"]],
  ["Canada", ["toronto", "ubc", "mcgill", "canada", "канад"]],
  ["Europe", ["europe", "европ", "germany", "герман", "france", "франц"]],
  ["Turkey", ["turk", "турк"]],
  ["Asia", ["asia", "ази"]],
  ["Mongolia", ["муис", "шутис", "дотоод", "mongolia", "монгол улс", "national university of mongolia"]],
];

// Short words that only count as whole words ("US" must not match "campus").
const WORDS: [Region, string[]][] = [
  ["US", ["us", "usa", "ану"]],
  ["UK", ["uk"]],
  ["Mongolia", ["num", "must"]],
];

export function regionsOf(destination: string): Region[] {
  const text = destination.toLowerCase();
  const tokens = new Set(text.split(/[^\p{L}']+/u).filter(Boolean));
  const found = new Set<Region>();
  for (const [region, fragments] of FRAGMENTS) {
    if (fragments.some((f) => text.includes(f))) found.add(region);
  }
  for (const [region, words] of WORDS) {
    if (words.some((w) => tokens.has(w))) found.add(region);
  }
  return [...found];
}

/** The destinations of one school that lead to `region` (all of them for null). */
export function destinationsIn(destinations: string[], region: Region | null) {
  return region ? destinations.filter((d) => regionsOf(d).includes(region)) : destinations;
}

/** Regions that at least one school leads to, most common first. */
export function regionsWithSchools(schools: { graduateDestinations: string[] }[]) {
  const counts = new Map<Region, number>();
  for (const school of schools) {
    const regions = new Set(school.graduateDestinations.flatMap(regionsOf));
    for (const region of regions) counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  return REGIONS.filter((r) => counts.has(r)).sort((a, b) => counts.get(b)! - counts.get(a)!);
}
