"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SchoolType } from "@prisma/client";
import { HeroSearchBar } from "@/components/search/HeroSearchBar";
import { Icon } from "@/components/common/Icon";
import { MATCH_LEVELS } from "@/lib/match";

/**
 * The homepage opening: a 3D scene you fly through by scrolling.
 *
 *   1. The headline and search box, with three soft shapes floating behind.
 *   2. The shapes become three blocks: the three kinds of school, with counts.
 *   3. The blocks become stops on one road: elementary, middle, high school.
 *   4. The road ends at university; the camera flies into it and the page begins.
 *
 * It is plain CSS 3D (no WebGL, no library): one "world" element holds every
 * object, and the camera is that world moved the opposite way. Scroll sets a
 * target progress `p` (0 to 1); each frame eases toward it, which is what
 * makes the camera feel fluid. Only transforms and opacity change per frame.
 *
 * Visitors who ask for reduced motion get the first screen only, unpinned.
 * Everything the scene says is repeated as real, usable content below it.
 */

const TYPES: SchoolType[] = ["PUBLIC", "PRIVATE", "INTERNATIONAL"];
const LINE_COLOR = ["var(--band-public)", "var(--band-private)", "var(--band-intl)"];
const PASTEL = ["var(--pastel-lavender)", "var(--pastel-pink)", "var(--pastel-taupe)"];

// --- Scene layout, in "units": 1 unit = 1% of the stage's shorter side. ---------
const PERSPECTIVE = 100;
/** Where each shape floats on the first screen: x, y, z, size. */
const BLOB = [
  [-56, -34, -45, 40],
  [58, 32, -75, 32],
  [44, -46, -120, 26],
];
const CUBE_Z = -260;
const CUBE_X = [-39, 0, 39];
const CUBE_SIZE = 33;
const STOP_Z = [-480, -600, -720];
const STOP_SIZE = 18;
const ROAD_Y = 16;
const GOAL_Z = -880;

/** Border radii (4 horizontal, 4 vertical, in %) for the three shapes a blob passes through. */
const R_BLOB = [
  [62, 38, 46, 54, 44, 58, 42, 56],
  [40, 60, 58, 42, 55, 45, 60, 40],
  [55, 45, 38, 62, 48, 62, 38, 52],
];
const R_SQUARE = [18, 18, 18, 18, 18, 18, 18, 18];
const R_CIRCLE = [50, 50, 50, 50, 50, 50, 50, 50];

/** Camera path: progress → x, y, z (forward), yaw°, pitch°. Read with a smooth spline. */
const CAMERA: [number, number, number, number, number, number][] = [
  [0, 0, 0, 0, 0, 0],
  [0.14, 0, 0, 22, 0, 0],
  [0.28, -12, -3, 120, -7, 1],
  [0.42, 0, 0, 220, 0, 0],
  [0.52, 3, 0, 228, 2, 0],
  [0.62, 24, -16, 330, 11, 9],
  [0.72, -22, -14, 425, -11, 9],
  [0.8, 16, -11, 548, 8, 7],
  [0.88, 0, -4, 680, 0, 3],
  [0.96, 0, 0, 835, 0, 0],
  [1, 0, 0, 850, 0, 0],
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before `a`, 1 after `b`, eased in between. */
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** A value that holds, then eases to the next keyframe: [[progress, value], …]. */
function track(frames: [number, number][], p: number) {
  if (p <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    if (p <= frames[i][0]) return lerp(frames[i - 1][1], frames[i][1], smooth(frames[i - 1][0], frames[i][0], p));
  }
  return frames[frames.length - 1][1];
}
/** Catmull-Rom through the camera keyframes, so the camera never stops dead at one. */
function camera(p: number) {
  let i = 1;
  while (i < CAMERA.length - 1 && p > CAMERA[i][0]) i++;
  const p1 = CAMERA[i - 1];
  const p2 = CAMERA[i];
  const p0 = CAMERA[Math.max(0, i - 2)];
  const p3 = CAMERA[Math.min(CAMERA.length - 1, i + 1)];
  const t = clamp01((p - p1[0]) / (p2[0] - p1[0]));
  const out = [0, 0, 0, 0, 0];
  for (let k = 1; k <= 5; k++) {
    out[k - 1] =
      0.5 *
      (2 * p1[k] +
        (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t);
  }
  return { x: out[0], y: out[1], z: out[2], yaw: out[3], pitch: out[4] };
}
/** Things fade in from the distance and fade out just before the camera passes them. */
const fog = (distance: number, far = 400) => smooth(6, 30, distance) * (1 - smooth(far * 0.6, far, distance));

/** "Choose a school [[with confidence]]" → words, with the highlighted ones marked. */
function splitTitle(markup: string) {
  const words: { text: string; highlight: boolean }[] = [];
  markup.split(/(\[\[.*?\]\])/).forEach((part) => {
    const highlight = part.startsWith("[[");
    const text = highlight ? part.slice(2, -2) : part;
    text
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => words.push({ text: word, highlight }));
  });
  return words;
}

export function ScrollStory({
  typeCounts,
  totalSchools,
}: {
  typeCounts: Partial<Record<SchoolType, number>>;
  totalSchools: number;
}) {
  const t = useTranslations("Home");
  const tType = useTranslations("SchoolType");
  const tMatch = useTranslations("Match");

  const sectionRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const typeLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stopLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kindsRef = useRef<HTMLHeadingElement>(null);
  const pathRef = useRef<HTMLHeadingElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const goalLabelRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const outroWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLAnchorElement>(null);

  const titleWords = splitTitle(t.markup("title", { hl: (chunks) => `[[${chunks}]]` }));
  const outroWords = t("storyEnd").split(/\s+/);
  const counts = TYPES.map((type) => typeCounts[type] ?? 0);

  useEffect(() => {
    const section = sectionRef.current;
    const world = worldRef.current;
    if (!section || !world) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let unit = 8; // px per scene unit; set by measure()
    // How far the first-screen shapes sit from the headline: out to the sides on a wide
    // screen, up and down on a tall phone, so they frame the text instead of covering it.
    let spread = 1;
    let rise = 1;
    let target = 0; // where scroll says we are
    let current = 0; // where the camera actually is (eases toward target)
    let pointerX = 0;
    let pointerY = 0;
    let swayX = 0;
    let swayY = 0;
    let frame = 0;
    let visible = true;
    const shownCounts = [-1, -1, -1];

    const measure = () => {
      const stage = world.parentElement!;
      // On a tall phone the scene is sized from the width, on a wide screen from the height.
      unit = Math.min(stage.clientWidth, stage.clientHeight * 0.9) / 100;
      spread = Math.min(1.5, Math.max(0.6, stage.clientWidth / stage.clientHeight));
      rise = Math.min(2.1, Math.max(1, stage.clientHeight / stage.clientWidth));
      world.style.perspective = `${PERSPECTIVE * unit}px`;
      world.style.setProperty("--u", `${unit}px`);
    };
    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      target = travel > 0 ? clamp01(-rect.top / travel) : 0;
    };

    /** Places one object in the world and fades it by its distance from the camera. */
    const place = (
      el: HTMLElement | null,
      x: number,
      y: number,
      z: number,
      cam: { z: number },
      opacity = 1,
      extra = "",
      far?: number
    ) => {
      if (!el) return;
      const o = opacity * fog(-z - cam.z, far);
      // A 3D block must stay fully opaque itself (opacity flattens 3D), so its faces fade instead.
      if (el.classList.contains("story-shape")) el.style.setProperty("--fade", o.toFixed(3));
      else el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
      el.style.transform = `translate(-50%, -50%) translate3d(${x * unit}px, ${y * unit}px, ${z * unit}px) ${extra}`;
    };

    const render = (p: number, time: number) => {
      const cam = camera(p);
      const scene = world.firstElementChild as HTMLElement;
      // The camera: move and turn the whole world the opposite way.
      scene.style.transform =
        `rotateX(${(-cam.pitch + swayY * 1.5).toFixed(3)}deg) rotateY(${(cam.yaw + swayX * 2.5).toFixed(3)}deg) ` +
        `translate3d(${(-(cam.x + swayX * 3) * unit).toFixed(2)}px, ${(-(cam.y + swayY * 2) * unit).toFixed(2)}px, ${(cam.z * unit).toFixed(2)}px)`;

      // 1. Headline: each word flies past the camera in turn. Search and subtitle lift away.
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        const q = smooth(0.015 + i * 0.012, 0.15 + i * 0.012, p);
        el.style.transform = `translate3d(0, ${-q * 5 * unit}px, ${q * 95 * unit}px) rotateX(${-q * 40}deg)`;
        el.style.opacity = (1 - q * q).toFixed(3);
      });
      if (introRef.current) {
        const q = smooth(0, 0.1, p);
        const intro = introRef.current;
        intro.style.opacity = (1 - q).toFixed(3);
        intro.style.transform = `translateY(${-q * 6 * unit}px)`;
        intro.style.visibility = q > 0.98 ? "hidden" : "visible";
        // Once it starts to leave, it stops catching taps meant for the scene.
        intro.style.pointerEvents = q > 0.3 ? "none" : "";
      }
      if (hintRef.current) hintRef.current.style.opacity = (1 - smooth(0.005, 0.04, p)).toFixed(3);
      if (skipRef.current) {
        const o = smooth(0.03, 0.08, p) * (1 - smooth(0.86, 0.9, p));
        skipRef.current.style.opacity = o.toFixed(3);
        skipRef.current.style.visibility = o < 0.05 ? "hidden" : "visible";
      }

      // 2 and 3. The three shapes: blob → block → stop on the road.
      shapeRefs.current.forEach((el, i) => {
        if (!el) return;
        const [bx, by, bz, bs] = BLOB[i];
        const drift = p < 0.3 ? 1 - smooth(0.1, 0.3, p) : 0; // idle float, first screen only
        const x = track([[0.12, bx * spread], [0.36, CUBE_X[i]], [0.54, CUBE_X[i]], [0.68, 0]], p) + Math.sin(time * 0.5 + i * 2) * 1.6 * drift;
        const y = track([[0.12, by * rise], [0.36, 4], [0.54, 4], [0.68, ROAD_Y]], p) + Math.cos(time * 0.4 + i) * 1.8 * drift;
        const z = track([[0.12, bz], [0.36, CUBE_Z], [0.54, CUBE_Z], [0.68, STOP_Z[i]]], p);
        const size = track([[0.12, bs], [0.36, CUBE_SIZE], [0.54, CUBE_SIZE], [0.68, STOP_SIZE]], p);
        const toSquare = smooth(0.14, 0.32, p);
        const toCircle = smooth(0.54, 0.66, p);
        const depth = track([[0.28, 0], [0.4, 1], [0.54, 1], [0.64, 0]], p);
        const spin = depth * Math.sin(time * 0.6 + i * 1.7) * 5;
        const rotY = track([[0.2, 0], [0.38, -32], [0.5, -22], [0.64, 0]], p) + spin;
        const rotX = track([[0.2, 0], [0.38, 18], [0.5, 14], [0.64, 0]], p);
        const rotZ = (1 - toSquare) * (time * 6 + i * 40);
        const radius = R_BLOB[i].map((r, k) => lerp(lerp(r, R_SQUARE[k], toSquare), R_CIRCLE[k], toCircle).toFixed(1));

        el.style.width = el.style.height = `${(size * unit).toFixed(1)}px`;
        el.style.setProperty("--half", `${((size * unit) / 2).toFixed(1)}px`);
        el.style.setProperty("--depth", Math.max(0.001, depth).toFixed(3));
        el.style.setProperty("--tint", smooth(0.2, 0.34, p).toFixed(3));
        el.style.setProperty("--sides", smooth(0.15, 0.4, depth).toFixed(3));
        el.style.setProperty("--ring", smooth(0.58, 0.68, p).toFixed(3));
        el.style.setProperty("--radius", `${radius.slice(0, 4).join("% ")}% / ${radius.slice(4).join("% ")}%`);
        place(el, x, y, z, cam, 1, `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`);

        // The count on the block's face ticks up as the block forms.
        const number = numberRefs.current[i];
        if (number) {
          number.style.opacity = (smooth(0.33, 0.41, p) * (1 - smooth(0.52, 0.58, p))).toFixed(3);
          const shown = Math.round(counts[i] * smooth(0.31, 0.43, p));
          if (shown !== shownCounts[i]) {
            shownCounts[i] = shown;
            number.textContent = String(shown);
          }
        }
        const lift = 1 - smooth(0.34, 0.44, p);
        place(
          typeLabelRefs.current[i],
          CUBE_X[i],
          4 + CUBE_SIZE / 2 + 9 + lift * 6,
          CUBE_Z,
          cam,
          (1 - lift) * (1 - smooth(0.52, 0.58, p))
        );
        place(stopLabelRefs.current[i], 0, ROAD_Y - STOP_SIZE / 2 - 6, STOP_Z[i], cam, smooth(0.64, 0.7, p), "", 150);
      });

      // Chapter headings: letters tighten as the camera arrives.
      const kinds = smooth(0.26, 0.4, p) * (1 - smooth(0.52, 0.58, p));
      if (kindsRef.current) kindsRef.current.style.letterSpacing = `${lerp(0.5, -0.02, smooth(0.26, 0.42, p)).toFixed(3)}em`;
      place(kindsRef.current, 0, -30, CUBE_Z, cam, kinds);
      const path = smooth(0.56, 0.64, p) * (1 - smooth(0.67, 0.73, p));
      if (pathRef.current) pathRef.current.style.letterSpacing = `${lerp(0.5, -0.02, smooth(0.56, 0.68, p)).toFixed(3)}em`;
      place(pathRef.current, 0, -50, -470, cam, path);

      // The road and its destination.
      if (roadRef.current) {
        roadRef.current.style.visibility = p > 0.5 ? "visible" : "hidden";
        roadRef.current.style.opacity = smooth(0.56, 0.68, p).toFixed(3);
        roadRef.current.style.transform = `translate(-50%, -50%) translate3d(0, ${ROAD_Y * unit}px, ${-660 * unit}px) rotateX(90deg)`;
        roadRef.current.style.width = `${5 * unit}px`;
        roadRef.current.style.height = `${460 * unit}px`;
      }
      const arrive = smooth(0.86, 0.95, p);
      if (goalRef.current) {
        goalRef.current.style.width = goalRef.current.style.height = `${44 * unit}px`;
        goalRef.current.style.visibility = p > 0.55 ? "visible" : "hidden";
        goalRef.current.style.opacity = smooth(0.6, 0.72, p).toFixed(3);
        goalRef.current.style.transform = `translate(-50%, -50%) translate3d(0, ${lerp(2, 0, arrive) * unit}px, ${GOAL_Z * unit}px) scale(${lerp(1, 4, arrive).toFixed(3)})`;
      }
      place(goalLabelRef.current, 0, -30, GOAL_Z, cam, smooth(0.72, 0.8, p) * (1 - smooth(0.86, 0.9, p)));

      // 4. Arrival: the light of the destination becomes the page.
      if (washRef.current) washRef.current.style.opacity = smooth(0.875, 0.93, p).toFixed(3);
      if (outroRef.current) {
        const show = p > 0.9;
        outroRef.current.style.visibility = show ? "visible" : "hidden";
        outroRef.current.style.opacity = smooth(0.915, 0.96, p).toFixed(3);
      }
      outroWordRefs.current.forEach((el, i) => {
        if (!el) return;
        const q = 1 - smooth(0.915 + i * 0.006, 0.965 + i * 0.006, p);
        el.style.transform = `translate3d(0, ${q * 4 * unit}px, ${-q * 60 * unit}px) rotateX(${q * 50}deg)`;
        el.style.opacity = (1 - q).toFixed(3);
      });
    };

    const tick = (now: number) => {
      current += (target - current) * 0.09;
      if (Math.abs(target - current) < 0.0003) current = target;
      swayX += (pointerX - swayX) * 0.05;
      swayY += (pointerY - swayY) * 0.05;
      render(current, now / 1000);
      frame = visible ? requestAnimationFrame(tick) : 0;
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      measure();
      readScroll();
      if (reduced) render(0, 0);
    };

    measure();
    readScroll();
    current = target;
    render(reduced ? 0 : current, 0);
    world.dataset.ready = "true";
    window.addEventListener("resize", onResize);
    if (reduced) return () => window.removeEventListener("resize", onResize);

    // The loop only runs while the scene is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    observer.observe(section);
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- counts only change with a new page load
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="story-title" className="story relative bg-band text-white">
      <div className="story-stage sticky top-0 isolate h-[100svh] overflow-hidden">
        {/* A soft glow behind everything, so the plum has depth. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_50%_20%,color-mix(in_oklab,var(--pastel-lavender)_16%,transparent),transparent_70%)]"
        />

        {/* The 3D world. Decorative shapes are hidden from screen readers; the headings are read. */}
        <div ref={worldRef} className="story-world absolute inset-0">
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            <div ref={roadRef} aria-hidden className="story-object story-road" />

            {TYPES.map((type, i) => (
              <div
                key={type}
                ref={(el) => {
                  shapeRefs.current[i] = el;
                }}
                aria-hidden
                className="story-object story-shape"
                style={{ "--pastel": PASTEL[i], "--line-color": LINE_COLOR[i] } as React.CSSProperties}
              >
                <span className="story-face story-face-front">
                  <span
                    ref={(el) => {
                      numberRefs.current[i] = el;
                    }}
                    className="font-display text-[length:calc(var(--half)*0.8)] font-bold tabular-nums text-band"
                  />
                  <span className="story-ring" />
                </span>
                <span className="story-face story-face-back" />
                <span className="story-face story-face-right" />
                <span className="story-face story-face-left" />
                <span className="story-face story-face-top" />
                <span className="story-face story-face-bottom" />
              </div>
            ))}

            <h2 ref={kindsRef} className="story-object story-heading">
              {t("storyKinds", { count: totalSchools })}
            </h2>
            {TYPES.map((type, i) => (
              <div
                key={type}
                ref={(el) => {
                  typeLabelRefs.current[i] = el;
                }}
                className="story-object story-label"
                style={{ color: LINE_COLOR[i] }}
              >
                {tType(type)}
              </div>
            ))}

            <h2 ref={pathRef} className="story-object story-heading">
              {t("storyPath")}
            </h2>
            {MATCH_LEVELS.map((level, i) => (
              <div
                key={level}
                ref={(el) => {
                  stopLabelRefs.current[i] = el;
                }}
                className="story-object story-label text-white"
              >
                {tMatch(`level.${level}`)}
              </div>
            ))}

            <div ref={goalRef} aria-hidden className="story-object story-goal" />
            <div ref={goalLabelRef} className="story-object story-label text-gold">
              {t("pathGoal")}
            </div>
          </div>
        </div>

        {/* First screen: the headline and the search box. Real, usable controls, not part of the 3D world. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-10 pt-20 [perspective:900px] sm:px-6">
          <div className="w-full max-w-2xl text-center [transform-style:preserve-3d]">
            <h1
              id="story-title"
              className="text-balance font-display text-[clamp(2.5rem,1.2rem+5.6vw,5rem)] font-bold leading-[1.02] tracking-[-0.035em] [transform-style:preserve-3d]"
            >
              {titleWords.map((word, i) => (
                <span key={i}>
                  <span
                    ref={(el) => {
                      wordRefs.current[i] = el;
                    }}
                    className={`inline-block will-change-transform ${word.highlight ? "text-gold" : ""}`}
                  >
                    <span className="story-word-in inline-block" style={{ animationDelay: `${i * 70}ms` }}>
                      {word.text}
                    </span>
                  </span>{" "}
                </span>
              ))}
            </h1>
            <div ref={introRef} className="pointer-events-auto">
              <p className="mx-auto mt-5 max-w-xl text-pretty text-[1.0625rem] leading-7 text-white/80">{t("subtitle")}</p>
              <div className="mx-auto mt-7 max-w-xl">
                <HeroSearchBar />
              </div>
              {totalSchools > 0 && (
                <p className="mt-3 text-sm text-white/70">
                  {t.rich("listedSoFar", {
                    count: totalSchools,
                    b: (chunks) => <span className="font-semibold text-white">{chunks}</span>,
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          ref={hintRef}
          aria-hidden
          className="story-motion-only pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
        >
          {t("storyScroll")}
          <Icon name="chevron-down" className="size-4" />
        </div>
        <a
          ref={skipRef}
          href="#browse"
          className="story-motion-only invisible absolute bottom-5 right-4 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/25 bg-band/70 px-4 text-sm font-semibold text-white opacity-0 backdrop-blur transition-colors hover:bg-band-line sm:right-6"
        >
          {t("storySkip")}
          <Icon name="chevron-down" className="size-4" />
        </a>

        {/* Arrival: the destination's light fills the stage and becomes the page below. */}
        <div ref={washRef} aria-hidden className="pointer-events-none absolute inset-0 bg-background opacity-0" />
        <div
          ref={outroRef}
          className="invisible absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-foreground opacity-0 [perspective:900px]"
        >
          <p className="max-w-3xl text-balance font-display text-[clamp(2.25rem,1.2rem+4.6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.035em] [transform-style:preserve-3d]">
            {outroWords.map((word, i) => (
              <span key={i}>
                <span
                  ref={(el) => {
                    outroWordRefs.current[i] = el;
                  }}
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/match" className="btn-gold">
              {t("matchStart")}
              <Icon name="arrow-right" className="size-4" />
            </Link>
            <Link href="/search" className="btn-secondary">
              {t("viewAll", { count: totalSchools })}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
