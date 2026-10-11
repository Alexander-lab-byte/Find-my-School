"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { PathSchool } from "@/lib/schools";
import { destinationsIn, type Region } from "@/lib/destinations";
import { schoolNames } from "@/lib/labels";
import { MAX_COMPARE } from "@/lib/compare";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { Campus } from "@/components/home/Campus";

type Stage = "kinder" | "primary" | "middle" | "high";
type Dest = Region | "Anywhere";

const STAGES: Stage[] = ["kinder", "primary", "middle", "high"];
const PATH_HEIGHT = 3300;
const STOPS: { key: Stage | "uni"; y: number; side: "l" | "r" }[] = [
  { key: "kinder", y: 260, side: "r" },
  { key: "primary", y: 900, side: "l" },
  { key: "middle", y: 1540, side: "r" },
  { key: "high", y: 2180, side: "l" },
  { key: "uni", y: 2860, side: "r" },
];

// The path winds around the centre line; it ends exactly in the middle so it
// can flow straight on into the campus.
// On phones the path is a straight line down the left edge (amplitude 0).
const pathX = (y: number, amp: number) => 110 + amp * Math.sin((2 * Math.PI * y) / 1320);
const buildPath = (amp: number) => {
  let d = `M ${pathX(0, amp).toFixed(1)} 0`;
  for (let y = 20; y <= PATH_HEIGHT; y += 20) d += ` L ${pathX(y, amp).toFixed(1)} ${y}`;
  return d;
};
const PATH_D_WIDE = buildPath(70);
const PATH_D_PHONE = buildPath(0);

const PHONE_QUERY = "(max-width: 767px)";
function subscribePhone(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getPhone = () => window.matchMedia(PHONE_QUERY).matches;
const getPhoneOnServer = () => false;

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const v = clamp(x);
  return v * v * (3 - 2 * v);
};

// Front clouds sit along the bottom and the right edge, clear of the questions.
const HERO_CLOUDS = [
  { x: -18, y: 86, w: 700, dir: -1, speed: 1.1 },
  { x: 46, y: 88, w: 780, dir: 1, speed: 1.1 },
  { x: 16, y: 95, w: 860, dir: -1, speed: 1.4 },
  { x: 74, y: 8, w: 460, dir: 1, speed: 0.9 },
  { x: 86, y: 44, w: 420, dir: 1, speed: 1.2 },
];
const BACK_CLOUDS = [
  { x: 6, y: 16, w: 260 },
  { x: 70, y: 12, w: 320 },
  { x: 40, y: 4, w: 220 },
  { x: 88, y: 46, w: 240 },
];
const FLOOR_CLOUDS = [
  { x: -8, y: 30, w: 560 },
  { x: 14, y: 10, w: 640 },
  { x: 38, y: 34, w: 600 },
  { x: 58, y: 6, w: 620 },
  { x: 76, y: 28, w: 560 },
  { x: 94, y: 12, w: 480 },
];

type Progress = { hero: number; path: number; campus: number };

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduceMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getReduceMotion = () => window.matchMedia(REDUCE_QUERY).matches;
const getReduceMotionOnServer = () => false;

export function PathExperience({
  schools,
  regions,
}: {
  schools: PathSchool[];
  regions: Region[];
}) {
  const t = useTranslations("Path");
  const locale = useLocale();
  const [stage, setStage] = useState<Stage>("primary");
  const [dest, setDest] = useState<Dest>(regions[0] ?? "Anywhere");
  const [progress, setProgress] = useState<Progress>({ hero: 0, path: 0, campus: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const reduceMotion = useSyncExternalStore(subscribeReduceMotion, getReduceMotion, getReduceMotionOnServer);
  const isPhone = useSyncExternalStore(subscribePhone, getPhone, getPhoneOnServer);
  const amp = isPhone ? 0 : 70;
  const px = (y: number) => pathX(y, amp);
  const pathD = isPhone ? PATH_D_PHONE : PATH_D_WIDE;

  const heroRef = useRef<HTMLElement>(null);
  const pathRef = useRef<HTMLElement>(null);
  const campusRef = useRef<HTMLElement>(null);
  const walkRef = useRef<number | null>(null);

  // Scroll → progress of each part, read from the sections' real positions.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const hero = heroRef.current?.getBoundingClientRect();
      const path = pathRef.current?.getBoundingClientRect();
      const campus = campusRef.current?.getBoundingClientRect();
      if (!hero || !path || !campus) return;
      setProgress({
        hero: smooth(-hero.top / (hero.height * 0.7)),
        path: clamp((vh * 0.55 - path.top) / path.height),
        campus: smooth((vh - campus.top - 120) / (vh * 0.75)),
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // "Walk the path": scroll smoothly to the campus; any wheel/touch stops it.
  const stopWalk = useCallback(() => {
    if (walkRef.current) cancelAnimationFrame(walkRef.current);
    walkRef.current = null;
  }, []);
  const walk = useCallback(() => {
    stopWalk();
    const campus = campusRef.current;
    if (!campus) return;
    const end = campus.offsetTop + campus.offsetHeight - window.innerHeight;
    const from = window.scrollY >= end - 5 ? 0 : window.scrollY;
    if (reduceMotion) {
      window.scrollTo(0, end);
      return;
    }
    const duration = 11000 * (1 - from / Math.max(1, end)) + 600;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      window.scrollTo(0, from + (end - from) * e);
      walkRef.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    walkRef.current = requestAnimationFrame(step);
  }, [reduceMotion, stopWalk]);
  useEffect(() => {
    window.addEventListener("wheel", stopWalk, { passive: true });
    window.addEventListener("touchstart", stopWalk, { passive: true });
    window.addEventListener("keydown", stopWalk);
    return () => {
      window.removeEventListener("wheel", stopWalk);
      window.removeEventListener("touchstart", stopWalk);
      window.removeEventListener("keydown", stopWalk);
      stopWalk();
    };
  }, [stopWalk]);

  // Schools ranked by how many graduate destinations fall in the chosen region.
  const ranked = useMemo(() => {
    const region = dest === "Anywhere" ? null : dest;
    return schools
      .map((s) => ({ school: s, hits: destinationsIn(s.graduateDestinations, region) }))
      .filter((x) => x.hits.length > 0)
      .sort((a, b) => b.hits.length - a.hits.length);
  }, [schools, dest]);
  const onPath = useMemo(() => {
    const map: Record<string, true> = {};
    for (const x of ranked) map[x.school.id] = true;
    return map;
  }, [ranked]);
  const top = ranked.slice(0, 3);
  const universities = useMemo(() => {
    const byName = new Map<string, string[]>();
    for (const { school, hits } of ranked) {
      for (const name of hits) {
        const list = byName.get(name) ?? [];
        list.push(schoolNames(school, locale).primary);
        byName.set(name, list);
      }
    }
    return [...byName.entries()].slice(0, 8);
  }, [ranked, locale]);

  const place = t(`places.${dest}`);
  const nowIndex = STAGES.indexOf(stage);
  const p = reduceMotion ? 1 : progress.path;
  const campusLevel = reduceMotion ? 1 : Math.round(progress.campus * 40) / 40;
  const co = reduceMotion ? 0 : progress.hero;
  const travellerY = p * PATH_HEIGHT;
  const floor = 1 - smooth(travellerY / 380);
  const compareHref = `/compare?ids=${top.slice(0, MAX_COMPARE).map((x) => x.school.id).join(",")}`;

  return (
    <>
      {/* ---------------- Hero: in the clouds ---------------- */}
      <section
        ref={heroRef}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
        }}
        onMouseLeave={() => setMouse({ x: 0, y: 0 })}
        className="relative -mt-16 flex min-h-[860px] items-center overflow-hidden bg-gradient-to-b from-[#6f98ee] via-[#a9c6f7] to-[#dce7fa] pt-16 dark:from-[#0e1a3a] dark:via-[#16264d] dark:to-[#1a2a52]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_82%_18%,rgba(255,226,150,.55),transparent_70%)] dark:opacity-30"
        />
        {BACK_CLOUDS.map((c, i) => (
          <div
            key={`back${i}`}
            aria-hidden
            className="cloud cloud-drift pointer-events-none absolute origin-top-left opacity-80 transition-transform duration-500 ease-out max-md:scale-[.45]"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.w,
              height: Math.round(c.w * 0.42),
              animationDelay: `-${i * 2}s`,
              transform: `translate(${-mouse.x * (10 + i * 8) * 2}px, ${-mouse.y * (10 + i * 8)}px) translateY(${-co * (20 + i * 6)}vh)`,
            }}
          />
        ))}

        <div
          className="relative z-[5] mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 pb-48 pt-16 sm:px-6"
          style={{ opacity: 1 - co * 0.9, transform: `translateY(${-co * 80}px)` }}
        >
          <p className="eyebrow enter !text-[#16309f] dark:!text-[#b3c3ff]">{t("eyebrow")}</p>
          <h1
            className="enter max-w-4xl text-balance font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-[#0b1220] sm:text-7xl dark:text-white"
            style={{ animationDelay: "80ms" }}
          >
            {t("title")}
          </h1>
          <div
            className="glass enter flex max-w-3xl flex-col gap-5 rounded-[1.75rem] p-6 shadow-[0_30px_60px_-30px_rgba(42,73,168,.45)] sm:p-7"
            style={{ animationDelay: "160ms" }}
          >
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-extrabold text-foreground">{t("questionNow")}</legend>
              <div className="flex flex-wrap gap-2.5">
                {STAGES.map((s) => (
                  <button key={s} type="button" className="chip" aria-pressed={stage === s} onClick={() => setStage(s)}>
                    {t(`stages.${s}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-extrabold text-foreground">{t("questionDest")}</legend>
              <div className="flex flex-wrap gap-2.5">
                {[...regions, "Anywhere" as const].map((r) => (
                  <button key={r} type="button" className="chip is-accent" aria-pressed={dest === r} onClick={() => setDest(r)}>
                    {t(`regions.${r}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={walk} className="btn-primary">
                {t("showPath")}
              </button>
              <span className="font-semibold text-foreground">{t("matchCount", { count: ranked.length })}</span>
              <Link href="/search" className="ml-auto text-sm font-bold text-accent hover:underline hover:underline-offset-4">
                {t("orSearch")}
              </Link>
            </div>
          </div>
        </div>

        {HERO_CLOUDS.map((c, i) => (
          <div
            key={`front${i}`}
            aria-hidden
            className={`cloud pointer-events-none absolute z-[4] origin-bottom-left max-md:scale-[.6] ${i >= 3 ? "max-md:hidden" : ""}`}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.w,
              height: Math.round(c.w * 0.42),
              opacity: Math.max(0, 1 - co * 1.1),
              transform: `translate(${c.dir * co * c.speed * 60}vw, ${co * c.speed * 18}vh) scale(${1 + co * 0.6 * c.speed})`,
            }}
          />
        ))}
      </section>

      {/* ---------------- The path ---------------- */}
      <section
        ref={pathRef}
        aria-label={t("pathAria")}
        className="relative mx-auto w-full max-w-6xl max-md:mb-72"
        style={{ height: PATH_HEIGHT }}
      >
        {/* Cloud floor you pass through when leaving the sky */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-60px] z-[4] -ml-[50vw] h-80 w-screen"
          style={{ opacity: 0.95 * (0.35 + 0.65 * co) }}
        >
          {FLOOR_CLOUDS.map((c, i) => (
            <div
              key={`floor${i}`}
              className="cloud absolute max-md:scale-[.55]"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: c.w,
                height: Math.round(c.w * 0.42),
                marginLeft: -Math.round(c.w / 2),
                transform: `translate(${(i % 2 ? 1 : -1) * (1 - floor) * 30}vw, ${-(1 - floor) * 60}px)`,
              }}
            />
          ))}
        </div>

        {/* Floating summary of the chosen path, only while walking it */}
        <div
          className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 transition-[opacity,transform] duration-500"
          style={{
            opacity: p > 0.01 && progress.campus < 0.1 ? 1 : 0,
            transform: `translateY(${p > 0.01 && progress.campus < 0.1 ? 0 : 24}px)`,
          }}
          aria-hidden
        >
          <div className="glass flex items-center gap-3 whitespace-nowrap rounded-full !bg-surface/85 px-5 py-2.5 text-sm font-bold text-foreground shadow-[0_16px_30px_-12px_rgba(11,18,32,.45)] max-md:gap-2 max-md:px-4 max-md:py-2 max-md:text-xs">
            <span>
              {t(`stages.${stage}`)} → {t(`regions.${dest}`)}
            </span>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line max-md:w-12">
              <span
                className="block h-full origin-left rounded-full bg-gradient-to-r from-accent to-gold"
                style={{ transform: `scaleX(${p})` }}
              />
            </span>
            <span className="text-muted">{t("matchShort", { count: ranked.length })}</span>
          </div>
        </div>

        <div aria-hidden className="absolute left-1/2 top-0 -ml-[110px] w-[220px] max-md:left-0 max-md:-ml-[72px]" style={{ height: PATH_HEIGHT }}>
          <svg width="220" height={PATH_HEIGHT} viewBox={`0 0 220 ${PATH_HEIGHT}`} className="absolute inset-0 overflow-visible">
            <defs>
              <linearGradient id="path-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={PATH_HEIGHT}>
                <stop offset="0" stopColor="#2448e8" />
                <stop offset="1" stopColor="#ffc24d" />
              </linearGradient>
            </defs>
            <path d={pathD} fill="none" className="stroke-surface" strokeOpacity={0.9} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 22" />
            <path
              d={pathD}
              fill="none"
              stroke="url(#path-gradient)"
              strokeWidth={10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - p}
            />
          </svg>

          {STOPS.map((stop, i) => {
            const reached = p * PATH_HEIGHT >= stop.y - 40;
            const isNow = i === nowIndex;
            const done = i < nowIndex;
            const nx = px(stop.y);
            const lineLeft = stop.side === "r" ? nx + 28 : -10;
            const lineWidth = stop.side === "r" ? Math.max(0, 230 - nx - 28) : Math.max(0, nx - 18);
            return (
              <div key={stop.key}>
                <div
                  className="absolute z-[1] h-1 rounded-full transition-[transform,opacity] duration-700 max-md:hidden"
                  style={{
                    top: stop.y - 2,
                    left: lineLeft,
                    width: lineWidth,
                    background: isNow ? "var(--accent)" : "var(--foreground)",
                    opacity: reached ? 0.35 : 0,
                    transformOrigin: stop.side === "r" ? "left" : "right",
                    transform: `scaleX(${reached ? 1 : 0})`,
                  }}
                />
                <div
                  className={`absolute z-[2] grid size-14 place-items-center rounded-full font-display text-xl font-extrabold transition-all duration-500 ${
                    reached
                      ? isNow
                        ? "scale-110 bg-accent text-accent-foreground shadow-[0_0_0_8px_color-mix(in_oklab,var(--accent)_18%,transparent)]"
                        : "scale-110 bg-foreground text-background shadow-[0_0_0_8px_rgba(11,18,32,.08)]"
                      : "border-[3px] border-line bg-surface text-subtle"
                  }`}
                  style={{ left: nx - 28, top: stop.y - 28 }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`absolute z-[2] w-36 text-center text-xs font-extrabold uppercase tracking-[0.06em] transition-opacity duration-500 max-md:hidden ${
                    isNow ? "text-accent" : "text-foreground"
                  }`}
                  style={{ left: nx - 72, top: stop.y + 36, opacity: reached ? 1 : 0.4 }}
                >
                  {stop.key === "uni" ? t("stages.uni") : t(`stages.${stop.key}`)}
                </span>
              </div>
            );
          })}

          <div
            className="absolute z-[3] -ml-8 -mt-8 size-16 transition-opacity duration-300 max-md:scale-75"
            style={{ left: px(travellerY), top: travellerY, opacity: progress.campus > 0.12 ? 0 : 1 }}
          >
            <div className="grid size-16 animate-[traveller-bob_2.2s_ease-in-out_infinite] place-items-center rounded-full border-4 border-accent bg-surface shadow-[0_14px_30px_-10px_rgba(11,18,32,.45)]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <path d="M6 8a6 6 0 0 1 12 0v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                <path d="M9 14h6" />
              </svg>
            </div>
          </div>
        </div>

        {STOPS.map((stop, i) => {
          const reached = reduceMotion || p * PATH_HEIGHT >= stop.y - 40;
          const isNow = i === nowIndex;
          const done = i < nowIndex;
          const isUni = stop.key === "uni";
          const isHigh = stop.key === "high";
          const badge = isNow ? t("badgeNow") : done ? t("badgeDone") : isUni ? t("badgeGoal") : t("badgeNext");
          return (
            <article
              key={stop.key}
              id={`stage-${stop.key}`}
              className={`absolute w-[min(470px,40%)] transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)] max-md:!left-[80px] max-md:!right-4 max-md:!w-auto ${
                stop.side === "r" ? "left-[calc(50%+120px)]" : "right-[calc(50%+120px)]"
              }`}
              style={{
                top: stop.y - 70,
                opacity: reached ? (done ? 0.6 : 1) : 0,
                transform: reached ? "none" : `translateX(${stop.side === "r" ? 70 : -70}px)`,
              }}
            >
              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-line bg-surface/92 p-7 shadow-[var(--shadow-card)] backdrop-blur-md max-md:gap-3 max-md:rounded-3xl max-md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="eyebrow">{t(`ages.${stop.key}`)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      isNow ? "bg-accent text-accent-foreground" : isUni ? "bg-gold text-gold-foreground" : "bg-surface-muted text-muted"
                    }`}
                  >
                    {badge}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-extrabold leading-tight text-foreground sm:text-4xl">
                  {isUni ? (dest === "Anywhere" ? t("uniAnywhere") : t("uniIn", { place })) : t(`stageTitles.${stop.key}`)}
                </h2>
                <p className="leading-relaxed text-muted max-md:text-[15px]">{t(`stageTexts.${stop.key}`)}</p>

                {(stop.key === "kinder" || stop.key === "primary" || stop.key === "middle") && (
                  <ul className="flex flex-wrap gap-2">
                    {(t.raw(`stageTags.${stop.key}`) as string[]).map((tag) => (
                      <li key={tag} className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                {isHigh && top.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-extrabold text-foreground">{t("bestOnPath")}</p>
                    {top.map(({ school, hits }) => (
                      <Link
                        key={school.id}
                        href={`/school/${school.id}`}
                        className="lift flex items-center gap-3.5 rounded-2xl border border-line bg-background/70 p-3"
                      >
                        <SchoolMonogram name={school.nameEn} type={school.type} />
                        <span className="flex min-w-0 flex-col">
                          <span className="font-display font-bold text-foreground">{schoolNames(school, locale).primary}</span>
                          <span className="truncate text-sm text-muted">{hits.slice(0, 3).join(", ")}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {isUni && universities.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-extrabold text-foreground">{t("reportedBySchools")}</p>
                    <div className="grid grid-cols-2 gap-2.5 max-md:[&>*:nth-child(n+5)]:hidden">
                      {universities.map(([name, from]) => (
                        <div key={name} className="flex flex-col gap-1 rounded-2xl bg-gradient-to-br from-[#fff6da] to-[#ffe7a3] p-3.5">
                          <span className="font-display font-bold leading-tight text-[#3a2a00]">{name}</span>
                          <span className="line-clamp-2 text-xs font-bold text-[#6b5310]">{from.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(isHigh || isUni) && ranked.length === 0 && (
                  <p className="rounded-2xl bg-surface-muted p-4 text-muted">{t("noMatches")}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* ---------------- Arrival: the campus ---------------- */}
      <section
        ref={campusRef}
        id="campus"
        className="relative h-[1240px] overflow-hidden bg-gradient-to-b from-transparent via-[#c9d8f5] to-[#f3c9a0] max-lg:h-[1080px] max-md:h-[900px] max-sm:h-[820px] dark:via-[#1b2a52] dark:to-[#3b2a3a]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_18%_70%,rgba(255,190,120,.5),transparent_70%)] dark:opacity-40" />
        <div
          aria-hidden
          className="absolute left-1/2 top-0 z-[3] -ml-[5px] h-24 w-2.5 origin-top rounded-full bg-gradient-to-b from-[#f4b740] to-gold max-md:hidden"
          style={{ transform: `scaleY(${smooth(progress.campus / 0.25)})` }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-[66px] z-[4] -ml-8 grid size-16 place-items-center rounded-full border-4 border-white bg-gold text-gold-foreground shadow-[0_14px_30px_-10px_rgba(11,18,32,.45)] transition-[opacity,transform] duration-500"
          style={{
            opacity: reduceMotion ? 1 : smooth((progress.campus - 0.18) / 0.15),
            transform: `scale(${0.6 + 0.4 * (reduceMotion ? 1 : smooth((progress.campus - 0.18) / 0.15))})`,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </div>

        <div
          className="relative z-[3] flex flex-col items-center gap-3 px-4 pt-40 text-center max-md:pt-32"
          style={{ opacity: reduceMotion ? 1 : clamp(progress.campus * 1.4) }}
        >
          <p className="eyebrow">{t("arrived", { place: dest === "Anywhere" ? t("uniAnywhere") : t("uniIn", { place }) })}</p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("campusTitle", { count: ranked.length })}
          </h2>
          <ul className="flex flex-wrap justify-center gap-5 text-sm font-bold text-foreground">
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-[3px] bg-gradient-to-b from-[#fff1bf] to-[#ffc24d] shadow-[0_0_10px_rgba(255,190,70,.9)]" />
              {t("legendOnPath")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-[3px] border border-[#9fb3e6] bg-[#dce6ff]" />
              {t("legendOther")}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-[3px] bg-gradient-to-br from-[#7d97c9] to-[#4b6699]" />
              {t("legendEmpty")}
            </li>
          </ul>
          <div
            className="mt-2 flex flex-wrap justify-center gap-3 transition-[opacity,transform] duration-500"
            style={{
              opacity: reduceMotion ? 1 : smooth((progress.campus - 0.88) / 0.1),
              transform: `translateY(${reduceMotion ? 0 : (1 - smooth((progress.campus - 0.88) / 0.1)) * 16}px)`,
              pointerEvents: reduceMotion || progress.campus > 0.9 ? "auto" : "none",
            }}
          >
            {top.length >= 2 && (
              <Link href={compareHref} className="btn-primary !bg-accent !text-accent-foreground">
                {t("compareTop", { count: Math.min(top.length, MAX_COMPARE) })}
              </Link>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
            >
              {t("changeDest")}
            </button>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-[1000px] origin-bottom"
          style={{
            transform: reduceMotion ? "none" : `translateY(${(1 - progress.campus) * 260}px) scale(${0.88 + 0.12 * progress.campus})`,
            opacity: reduceMotion ? 1 : clamp(progress.campus * 1.4),
          }}
        >
          <div aria-hidden className="absolute -bottom-[120px] -left-[10vw] -right-[10vw] h-[250px] rounded-[50%_50%_0_0] bg-[#86b985] dark:bg-[#2f5a3a]" />
          <Campus level={campusLevel} schools={schools} onPath={onPath} place={place} />
        </div>
      </section>
    </>
  );
}
