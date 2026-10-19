"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CitySchool } from "@/lib/schools";
import { schoolNames } from "@/lib/labels";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { CompareButton } from "@/components/compare/CompareButton";

/*
 * A 3D ring of school cards. Drag, swipe, arrow keys or the buttons spin it.
 * "Details" flips the front card to show where graduates went.
 * With many schools the ring would get huge, so it shows the top 16 and the
 * "browse all" link covers the rest.
 */
const MAX_CARDS = 16;

export function SchoolTurntable({ schools }: { schools: CitySchool[] }) {
  const t = useTranslations("City");
  const tPlace = useTranslations("Place");
  const tCurriculum = useTranslations("CurriculumShort");
  const tLanguage = useTranslations("Language");
  const tType = useTranslations("SchoolType");
  const locale = useLocale();

  const cards = schools.slice(0, MAX_CARDS);
  const n = cards.length;
  const step = 360 / Math.max(n, 1);

  const [rot, setRot] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [cardW, setCardW] = useState(260);
  const drag = useRef<{ x: number; r0: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setCardW(mq.matches ? 232 : 260);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (n === 0) return null;

  // Ring radius that leaves a small gap between neighbouring cards.
  const radius = Math.max(cardW, Math.round(((cardW + 28) * n) / (2 * Math.PI)));
  const front = (((Math.round(-rot / step) % n) + n) % n) as number;

  const spin = (by: number) => {
    setFlipped(null);
    setRot((r) => Math.round(r / step) * step - by * step);
  };

  const label = (name: string) => (tPlace.has(name) ? tPlace(name) : name);

  return (
    <div>
      <div
        className={`relative h-[440px] select-none overflow-hidden [perspective:1400px] sm:h-[470px] ${dragging ? "cursor-grabbing" : "cursor-grab"} [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]`}
        style={{ touchAction: "pan-y" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("turnTitle")}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") spin(-1);
          if (e.key === "ArrowRight") spin(1);
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("a,button")) return;
          drag.current = { x: e.clientX, r0: rot };
          setDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setRot(drag.current.r0 + (e.clientX - drag.current.x) * 0.18);
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          drag.current = null;
          setDragging(false);
          setFlipped(null);
          setRot((r) => Math.round(r / step) * step);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        <div
          className="absolute left-1/2 top-5 [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{
            transform: `translateZ(${-radius}px) rotateY(${rot}deg)`,
            transitionDuration: dragging ? "0ms" : undefined,
          }}
        >
          {cards.map((s, i) => {
            const d = Math.min((i - front + n) % n, (front - i + n) % n);
            const isFront = d === 0;
            const { primary, secondary } = schoolNames(s, locale);
            const isFlipped = flipped === s.id;
            return (
              <article
                key={s.id}
                aria-hidden={!isFront}
                inert={!isFront}
                className="absolute top-0 h-[390px] [transform-style:preserve-3d] motion-safe:transition-opacity motion-safe:duration-500 sm:h-[410px]"
                style={{
                  width: cardW,
                  left: -cardW / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  opacity: [1, 0.55, 0.22][d] ?? 0,
                  visibility: d > 2 ? "hidden" : undefined,
                }}
              >
                <div
                  className="relative size-full [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-700"
                  style={{ transform: isFlipped ? "rotateY(180deg)" : undefined }}
                >
                  {/* Front */}
                  <div className="holo absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-[1.5rem] border border-line-strong bg-surface p-5 [backface-visibility:hidden]">
                    <div className="flex items-start justify-between gap-3">
                      <SchoolMonogram name={s.nameEn} type={s.type} />
                      <p className="data-label text-right">
                        {s.latitude != null && s.longitude != null ? (
                          <>
                            {s.latitude.toFixed(3)}°N
                            <br />
                            {s.longitude.toFixed(3)}°E
                          </>
                        ) : (
                          t("notOnMap")
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-lg leading-tight">{primary}</h3>
                      {secondary && <p className="mt-1 line-clamp-1 text-sm text-muted">{secondary}</p>}
                    </div>
                    <dl className="mt-auto grid gap-1.5 text-[13px]">
                      {[
                        [t("district"), s.district ? label(s.district) : "—"],
                        [t("curriculum"), s.curriculum.map((c) => tCurriculum(c)).join(" · ") || tType(s.type)],
                        [
                          t("languages"),
                          s.teachingLanguages.map((l) => (tLanguage.has(l) ? tLanguage(l) : l)).join(", ") || "—",
                        ],
                        [t("founded"), s.foundedYear ? String(s.foundedYear) : "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-t border-line pt-1.5">
                          <dt className="text-subtle">{k}</dt>
                          <dd className="text-right font-bold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex gap-2">
                      <Link href={`/school/${s.id}`} className="btn-primary flex-1 !min-h-[42px] !px-3 !py-2 text-sm">
                        {t("openProfile")}
                      </Link>
                      <button
                        type="button"
                        className="btn-secondary !min-h-[42px] !px-3 !py-2 text-sm"
                        onClick={() => setFlipped(s.id)}
                      >
                        {t("details")}
                      </button>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-[1.5rem] border border-accent/30 bg-surface p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="eyebrow">{t("graduates")}</p>
                    <h3 className="font-display text-base leading-tight">{primary}</h3>
                    {s.graduateDestinations.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {s.graduateDestinations.slice(0, 8).map((g) => (
                          <li key={g} className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                            {g}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted">{t("noGraduates")}</p>
                    )}
                    <p className="text-xs text-subtle">{t("reported")}</p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <CompareButton schoolId={s.id} />
                      <button
                        type="button"
                        className="btn-secondary ml-auto !min-h-[38px] !px-3 !py-1.5 text-sm"
                        onClick={() => setFlipped(null)}
                      >
                        {t("back")}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => spin(-1)}
          aria-label={t("prev")}
          className="grid size-12 place-items-center rounded-full border border-line-strong bg-white/5 transition hover:border-accent"
        >
          <Icon name="arrow-left" className="size-5" />
        </button>
        <output aria-live="polite" className="data-label min-w-24 text-center">
          {t("position", { index: front + 1, total: n })}
        </output>
        <button
          type="button"
          onClick={() => spin(1)}
          aria-label={t("next")}
          className="grid size-12 place-items-center rounded-full border border-line-strong bg-white/5 transition hover:border-accent"
        >
          <Icon name="arrow-right" className="size-5" />
        </button>
      </div>
    </div>
  );
}
