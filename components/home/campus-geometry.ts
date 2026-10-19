// Fixed layout of the campus building on the homepage, in a 1240 × 960 box.
// Computed once at module load; the Campus component only decides colours.

export type CampusPart = {
  id: string;
  x: number;
  top: number;
  w: number;
  h: number;
  /** Width of the visible side wall (0 = hidden). */
  side: number;
  cols: number;
  rows: number;
  roof: "green" | "crown" | "solar" | "hvac" | "plain";
  balcony?: boolean;
};

export type CampusCell = {
  idx: number;
  part: string;
  r: number;
  c: number;
  /** Position inside its part. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Position in the whole building. */
  gx: number;
  gy: number;
  /** Stable 0–1 noise for light timing and tint. */
  j: number;
};

export const GROUND = 900;

export const PARTS: CampusPart[] = [
  { id: "L2", x: 250, top: 400, w: 220, h: 150, side: 0, cols: 5, rows: 3, roof: "hvac" },
  { id: "L1", x: 110, top: 540, w: 360, h: 360, side: 0, cols: 8, rows: 7, roof: "green" },
  { id: "T", x: 470, top: 90, w: 280, h: 810, side: 80, cols: 6, rows: 20, roof: "crown" },
  { id: "R1", x: 750, top: 500, w: 330, h: 400, side: 70, cols: 7, rows: 8, roof: "solar", balcony: true },
  { id: "R2", x: 710, top: 378, w: 430, h: 112, side: 70, cols: 10, rows: 2, roof: "plain" },
];

const PAD_X = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 12;
const GAP = 4;

export function partStepY(part: CampusPart) {
  return (part.h - PAD_TOP - PAD_BOTTOM) / part.rows;
}
export const PART_PAD_TOP = PAD_TOP;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rnd = seeded(11);
export const CELLS_BY_PART: Record<string, CampusCell[]> = {};
export const ALL_CELLS: CampusCell[] = [];

for (const part of PARTS) {
  const stepX = (part.w - PAD_X * 2) / part.cols;
  const stepY = partStepY(part);
  const cells: CampusCell[] = [];
  for (let r = 0; r < part.rows; r++) {
    for (let c = 0; c < part.cols; c++) {
      const x = Math.round(PAD_X + c * stepX + GAP / 2);
      const y = Math.round(PAD_TOP + r * stepY + GAP / 2);
      const cell: CampusCell = {
        idx: ALL_CELLS.length,
        part: part.id,
        r,
        c,
        x,
        y,
        w: Math.round(stepX - GAP),
        h: Math.round(stepY - GAP - 3),
        gx: part.x + x,
        gy: part.top + y,
        j: rnd(),
      };
      ALL_CELLS.push(cell);
      cells.push(cell);
    }
  }
  CELLS_BY_PART[part.id] = cells;
}

// Where schools live: tower windows first (rows 3–17, shuffled so they spread
// out), then the wings, so the building keeps working as schools are added.
const shuffle = seeded(29);
const towerSlots = ALL_CELLS.filter((c) => c.part === "T" && c.r >= 3 && c.r <= 17)
  .map((c) => ({ c, k: shuffle() }))
  .sort((a, b) => a.k - b.k)
  .map(({ c }) => c.idx);
const otherSlots = ALL_CELLS.filter((c) => !(c.part === "T" && c.r >= 3 && c.r <= 17))
  .map((c) => ({ c, k: shuffle() }))
  .sort((a, b) => a.k - b.k)
  .map(({ c }) => c.idx);

export const SCHOOL_SLOTS = [...towerSlots, ...otherSlots];
