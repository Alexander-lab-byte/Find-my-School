"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { PathSchool } from "@/lib/schools";
import { schoolNames } from "@/lib/labels";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import {
  ALL_CELLS,
  CELLS_BY_PART,
  GROUND,
  PART_PAD_TOP,
  PARTS,
  SCHOOL_SLOTS,
  partStepY,
  type CampusPart,
} from "@/components/home/campus-geometry";

const GLASS_OFF = "linear-gradient(160deg,#3b5c92 0%,#22375e 55%,#1a2b4b 100%)";
const GOLD = "linear-gradient(180deg,#fff1bf,#ffc24d)";
const SELECTED = "linear-gradient(180deg,#c2ceff,#2448e8)";

type Props = {
  /** 0–1: how far the visitor has arrived. Windows light up as it grows. */
  level: number;
  schools: PathSchool[];
  onPath: Record<string, true>;
  /** Destination in a sentence, e.g. "the UK". */
  place: string;
};

function Roof({ part }: { part: CampusPart }) {
  const depth = part.side || 60;
  const rh = Math.round(depth * 0.577);
  const color =
    part.roof === "green" ? "#6faf6e" : part.roof === "crown" ? "#0b1220" : part.roof === "solar" ? "#9db0c8" : "#aebbd0";
  const stepY = partStepY(part);
  return (
    <>
      <div
        className="absolute left-0"
        style={{
          top: -rh,
          width: part.w,
          height: rh,
          transform: "skewX(-60deg)",
          transformOrigin: "bottom left",
          background: color,
          boxShadow: "inset 0 -3px 0 rgba(0,0,0,.15)",
        }}
      />
      {part.roof === "green" && (
        <>
          {Array.from({ length: Math.floor(part.w / 64) }, (_, t) => {
            const size = 22 + (t % 3) * 6;
            return (
              <div
                key={t}
                className="absolute rounded-full"
                style={{
                  left: 24 + t * 64,
                  top: -rh - 8,
                  width: size,
                  height: size,
                  background: t % 2 ? "#3f8a4c" : "#4f9a5b",
                  boxShadow: "inset -4px -4px 0 rgba(0,0,0,.15)",
                }}
              />
            );
          })}
          <div
            className="absolute left-0 h-1.5 border-t-2 border-white bg-[rgba(220,235,255,.7)]"
            style={{ top: -6, width: part.w }}
          />
        </>
      )}
      {part.roof === "solar" &&
        Array.from({ length: 6 }, (_, t) => (
          <div
            key={t}
            className="absolute border-2 border-[#c9d4e4]"
            style={{
              left: 18 + t * 50,
              top: -rh + 8,
              width: 40,
              height: rh - 14,
              transform: "skewX(-60deg)",
              transformOrigin: "bottom left",
              background: "linear-gradient(135deg,#1e3a78,#2e5bb8)",
            }}
          />
        ))}
      {part.roof === "hvac" && (
        <>
          <div className="absolute rounded bg-gradient-to-b from-[#d5dce6] to-[#a9b4c4] shadow-[inset_0_0_0_2px_#8d99ab]" style={{ left: 30, top: -34, width: 52, height: 34 }} />
          <div className="absolute rounded bg-gradient-to-b from-[#d5dce6] to-[#a9b4c4] shadow-[inset_0_0_0_2px_#8d99ab]" style={{ left: 100, top: -26, width: 38, height: 26 }} />
          <div
            className="absolute animate-spin rounded-full [animation-duration:3s]"
            style={{ left: 44, top: -30, width: 24, height: 24, background: "repeating-conic-gradient(#6b778a 0 30deg,#8d99ab 30deg 60deg)" }}
          />
        </>
      )}
      {part.roof === "crown" && (
        <>
          {Array.from({ length: part.cols - 1 }, (_, f) => (
            <div
              key={`fin${f}`}
              className="pointer-events-none absolute top-0 z-[2] w-1 bg-[rgba(240,244,250,.75)]"
              style={{ left: Math.round(12 + (f + 1) * ((part.w - 24) / part.cols) - 2), height: part.h }}
            />
          ))}
          {[1, 2, 3, 4].map((fl) => (
            <div
              key={`slab${fl}`}
              className="pointer-events-none absolute z-[2] h-1.5 bg-[#e8edf5] shadow-[0_3px_0_rgba(11,18,32,.15)]"
              style={{ left: -8, top: Math.round(PART_PAD_TOP + fl * 4 * stepY - 4), width: part.w + 16 }}
            />
          ))}
        </>
      )}
      {part.balcony &&
        Array.from({ length: part.rows }, (_, i) => {
          const by = Math.round(PART_PAD_TOP + (i + 1) * stepY - 6);
          return (
            <div key={`b${i}`} className="pointer-events-none absolute z-[2]" style={{ left: -6, top: by - 12, width: part.w + 6 }}>
              <div className="h-3 border-t-2 border-white/80 bg-[rgba(200,225,255,.28)]" />
              <div className="h-[5px] bg-[#f2f5fa]" />
            </div>
          );
        })}
    </>
  );
}

function CampusInner({ level, schools, onPath, place }: Props) {
  const t = useTranslations("Path");
  const locale = useLocale();
  const [hover, setHover] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // Which school sits behind which window.
  const schoolAt = useMemo(() => {
    const map = new Map<number, PathSchool>();
    schools.forEach((s, i) => {
      if (i < SCHOOL_SLOTS.length) map.set(SCHOOL_SLOTS[i], s);
    });
    return map;
  }, [schools]);

  const lampsOn = level > 0.7;
  const selectedSchool = schools.find((s) => s.id === selected) ?? null;
  const hoverCell = hover === null ? null : ALL_CELLS[hover];
  const hoverSchool = hover === null ? null : schoolAt.get(hover) ?? null;

  return (
    <>
      <div className="absolute bottom-0 left-1/2 -ml-[620px] h-[960px] w-[1240px] origin-bottom scale-[.9] max-xl:scale-[.8] max-lg:scale-[.66] max-md:scale-[.5] max-sm:scale-[.32]">
        {/* Plaza and lawns */}
        <div
          aria-hidden
          className="absolute left-10 right-10 h-[60px] rounded-md shadow-[inset_0_6px_0_#d3ccbd]"
          style={{
            top: GROUND,
            background:
              "repeating-linear-gradient(90deg, transparent 0 58px, rgba(0,0,0,.06) 58px 60px), repeating-linear-gradient(0deg, transparent 0 18px, rgba(0,0,0,.05) 18px 20px), #e6e1d6",
          }}
        />
        <div aria-hidden className="absolute left-0 h-9 w-[300px] rounded-[30px] bg-[#7db37f]" style={{ top: GROUND + 24 }} />
        <div aria-hidden className="absolute right-0 h-9 w-[300px] rounded-[30px] bg-[#7db37f]" style={{ top: GROUND + 24 }} />

        {/* Antenna, sign and LED crown */}
        <div aria-hidden className="absolute left-[608px] top-[-40px] h-[120px] w-1 bg-[#0b1220]" />
        <div aria-hidden className="absolute left-[603px] top-[-50px] size-3.5 animate-pulse rounded-full bg-[#ff4d4d] shadow-[0_0_14px_#ff4d4d]" />
        <div
          aria-hidden
          className="absolute left-[462px] top-11 z-[3] grid h-10 w-[296px] place-items-center rounded-md bg-[#0b1220] font-display text-base font-extrabold uppercase tracking-[0.2em] text-white"
        >
          {t("campusSign")}
        </div>
        <div
          aria-hidden
          className="absolute left-[470px] top-20 z-[3] h-1.5 w-[280px] animate-[led-sweep_4s_linear_infinite] bg-[length:200%_100%]"
          style={{ backgroundImage: "linear-gradient(90deg,#2448e8,#7fe3ff,#2448e8)" }}
        />

        {/* Building blocks with their windows */}
        <div role="group" aria-label={t("campusAria")} className="absolute inset-0">
          {PARTS.map((part) => (
            <div key={part.id} className="absolute" style={{ left: part.x, top: part.top, width: part.w, height: part.h }}>
              <Roof part={part} />
              {part.side > 0 && (
                <div
                  aria-hidden
                  className="absolute top-0 shadow-[inset_0_0_0_2px_#8fa2c4]"
                  style={{
                    left: part.w,
                    width: part.side,
                    height: part.h,
                    transform: "skewY(-30deg)",
                    transformOrigin: "top left",
                    background:
                      "repeating-linear-gradient(0deg,transparent 0 36px,rgba(201,212,228,.55) 36px 40px),linear-gradient(180deg,#5d78a8,#2c4370)",
                  }}
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-[#c9d4e4] shadow-[inset_0_0_0_3px_#aebbd0]" />

              {CELLS_BY_PART[part.id].map((cell) => {
                const school = schoolAt.get(cell.idx);
                const mine = school ? onPath[school.id] : false;
                const start = mine ? 0.8 + cell.j * 0.12 : 0.4 + ((GROUND - cell.gy) / GROUND) * 0.38 + cell.j * 0.08;
                const lit = level > start;
                const style: React.CSSProperties = {
                  left: cell.x,
                  top: cell.y,
                  width: cell.w,
                  height: cell.h,
                };

                if (!school) {
                  // Empty rooms stay cool and dim so gold (your path) clearly stands out.
                  const warm = cell.j > 0.72;
                  style.background = !lit
                    ? GLASS_OFF
                    : warm
                      ? "linear-gradient(180deg,rgba(255,232,190,.42),rgba(240,210,160,.32))"
                      : cell.j > 0.36
                        ? "linear-gradient(160deg,#7d97c9,#4b6699)"
                        : "linear-gradient(160deg,#5f7db4,#344f82)";
                  return (
                    <span
                      key={cell.idx}
                      aria-hidden
                      onMouseEnter={() => setHover(cell.idx)}
                      onMouseLeave={() => setHover((h) => (h === cell.idx ? null : h))}
                      onClick={() => lit && setSelected("empty")}
                      className="absolute rounded-[2px] transition-[background] duration-700"
                      style={style}
                    />
                  );
                }

                const isSel = selected === school.id;
                style.background = !lit ? GLASS_OFF : isSel ? SELECTED : mine ? GOLD : "#dce6ff";
                style.boxShadow = !lit
                  ? "none"
                  : isSel
                    ? "0 0 22px rgba(36,72,232,.95)"
                    : mine
                      ? "0 0 22px rgba(255,190,70,1)"
                      : "0 0 10px rgba(220,230,255,.8)";
                return (
                  <button
                    key={cell.idx}
                    type="button"
                    disabled={!lit}
                    aria-label={schoolNames(school, locale).primary}
                    onMouseEnter={() => setHover(cell.idx)}
                    onMouseLeave={() => setHover((h) => (h === cell.idx ? null : h))}
                    onFocus={() => setHover(cell.idx)}
                    onBlur={() => setHover((h) => (h === cell.idx ? null : h))}
                    onClick={() => setSelected(school.id)}
                    className={`absolute z-[3] rounded-[2px] transition-[background,box-shadow,transform] duration-700 hover:scale-[1.35] hover:outline-3 hover:outline-white focus-visible:scale-[1.35] focus-visible:outline-3 focus-visible:outline-white enabled:cursor-pointer ${
                      mine && lit ? "animate-[window-spark_1s_var(--ease-out-soft)]" : ""
                    }`}
                    style={style}
                  />
                );
              })}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[4]"
                style={{
                  background:
                    "linear-gradient(115deg,rgba(255,255,255,.22) 0 14%,transparent 14% 36%,rgba(255,255,255,.1) 36% 41%,transparent 41%)",
                }}
              />
              {part.id === "R2" && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-10 h-[22px] bg-gradient-to-b from-[rgba(11,18,32,.35)] to-transparent"
                    style={{ top: part.h, width: part.w - 40 }}
                  />
                  <div aria-hidden className="absolute w-2.5 bg-[#aebbd0]" style={{ left: part.w - 30, top: part.h, height: GROUND - part.top - part.h }} />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Modern glass entrance */}
        <div aria-hidden className="absolute left-[480px] top-[780px] z-[5] h-[120px] w-[260px]">
          <div className="absolute -left-6 top-0 h-3.5 w-[308px] rounded bg-gradient-to-b from-[#f2f6fc] to-[#c9d4e4] shadow-[0_8px_14px_-6px_rgba(11,18,32,.4)]" />
          <div className="absolute left-[18px] top-[-34px] grid h-7 w-[224px] place-items-center rounded-md bg-[#0b1220] text-[12px] font-extrabold uppercase tracking-[0.2em] text-white">
            {t("campusSign")}
          </div>
          <div
            className="absolute left-0 top-3.5 h-[94px] w-[260px] border-x-4 border-[#aebbd0]"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.0) 0 62px, #aebbd0 62px 65px), linear-gradient(180deg, #8fb0e8, #4f6fa8)",
            }}
          />
          <div className="absolute left-[100px] top-[30px] h-[78px] w-[60px] rounded-t-[30px] border-4 border-b-0 border-[#0b1220] bg-gradient-to-b from-[#ffe7a3] to-[#ffc24d]">
            <div className="absolute left-1/2 top-2 h-[66px] w-1 -translate-x-1/2 bg-[#0b1220]/70" />
          </div>
          <div className="absolute left-[60px] top-[108px] h-2 w-[140px] bg-[#cfc7b6]" />
          <div className="absolute left-[46px] top-[116px] h-2 w-[168px] bg-[#c2b9a6]" />
        </div>

        {/* Street lamps, benches and trees */}
        {[200, 340, 430, 800, 900, 1040].map((x) => (
          <div key={`lamp${x}`} aria-hidden>
            <div className="absolute z-[6] h-[92px] w-[5px] rounded-sm bg-[#2b3446]" style={{ left: x, top: 842 }} />
            <div
              className="absolute z-[6] h-3 w-[23px] rounded-[8px_8px_3px_3px] transition-[background,box-shadow] duration-700"
              style={{
                left: x - 9,
                top: 832,
                background: lampsOn ? "#ffe3a0" : "#55607a",
                boxShadow: lampsOn ? "0 8px 30px 8px rgba(255,214,140,.65)" : "none",
              }}
            />
          </div>
        ))}
        {[270, 960].map((x) => (
          <div
            key={`bench${x}`}
            aria-hidden
            className="absolute z-[6] h-3 w-14 rounded-[3px] bg-[#8a5a33] shadow-[0_10px_0_-4px_#2b3446]"
            style={{ left: x, top: 912 }}
          />
        ))}
        {[
          { x: 20, h: 130, r: 76, c: "#4f9a5b" },
          { x: 110, h: 96, r: 56, c: "#3f8a4c" },
          { x: 300, h: 70, r: 44, c: "#5da868" },
          { x: 380, h: 120, r: 30, c: "#3f8a4c", tall: true },
          { x: 812, h: 120, r: 30, c: "#3f8a4c", tall: true },
          { x: 880, h: 70, r: 44, c: "#5da868" },
          { x: 1080, h: 100, r: 60, c: "#4f9a5b" },
          { x: 1160, h: 136, r: 76, c: "#3f8a4c" },
        ].map((tree) => {
          const crownH = tree.tall ? 140 : tree.r;
          const trunkH = Math.round(tree.h * 0.45);
          return (
            <div key={`tree${tree.x}`} aria-hidden>
              <div
                className="absolute z-[6] w-2.5 rounded bg-[#6b4a2b]"
                style={{ left: tree.x + tree.r / 2 - 5, top: 930 - trunkH, height: trunkH }}
              />
              <div
                className="absolute z-[6] shadow-[inset_-8px_-8px_0_rgba(0,0,0,.12)]"
                style={{
                  left: tree.x,
                  top: 930 - trunkH - crownH + 10,
                  width: tree.r,
                  height: crownH,
                  borderRadius: tree.tall ? "50% 50% 45% 45%" : "50%",
                  background: tree.c,
                }}
              />
            </div>
          );
        })}

        {hoverCell && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{ left: hoverCell.gx + hoverCell.w / 2, top: hoverCell.gy - 58 }}
          >
            <p className="whitespace-nowrap rounded-xl bg-[#0b1220] px-4 py-2.5 text-lg font-bold text-white shadow-[0_14px_30px_-10px_rgba(11,18,32,.6)]">
              {hoverSchool
                ? `${schoolNames(hoverSchool, locale).primary}${onPath[hoverSchool.id] ? ` · ${t("onYourPath")}` : ""}`
                : t("emptyRoomShort")}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-label={selectedSchool ? schoolNames(selectedSchool, locale).primary : t("emptyRoomTitle")}
          className="glass enter absolute bottom-8 left-4 z-30 flex w-[min(360px,calc(100%-2rem))] flex-col gap-3.5 rounded-[1.75rem] !bg-surface/95 p-7 shadow-[var(--shadow-lift)] sm:left-6"
        >
          <div className="flex items-start justify-between gap-3">
            {selectedSchool ? (
              <SchoolMonogram name={selectedSchool.nameEn} type={selectedSchool.type} />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted font-display text-xl font-bold text-muted">
                +
              </span>
            )}
            <button type="button" onClick={() => setSelected(null)} className="btn-secondary !min-h-0 !px-4 !py-2 text-sm">
              {t("close")}
            </button>
          </div>
          {selectedSchool ? (
            <>
              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-extrabold ${
                  onPath[selectedSchool.id] ? "bg-gold text-gold-foreground" : "bg-surface-muted text-muted"
                }`}
              >
                {onPath[selectedSchool.id] ? t("onPathTo", { place }) : t("notOnPath")}
              </span>
              <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
                {schoolNames(selectedSchool, locale).primary}
              </h3>
              {selectedSchool.graduateDestinations.length > 0 && (
                <p className="leading-relaxed text-muted">
                  {t("graduatesWent", { list: selectedSchool.graduateDestinations.slice(0, 4).join(", ") })}
                </p>
              )}
              <Link href={`/school/${selectedSchool.id}`} className="btn-primary">
                {t("openProfile")}
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-display text-2xl font-bold leading-tight text-foreground">{t("emptyRoomTitle")}</h3>
              <p className="leading-relaxed text-muted">{t("emptyRoomBody")}</p>
              <Link href="/about" className="btn-primary">
                {t("suggestSchool")}
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export const Campus = memo(CampusInner);
