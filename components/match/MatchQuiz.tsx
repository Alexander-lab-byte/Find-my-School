"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { requestNearParam } from "@/components/search/NearMeButton";
import {
  MATCH_BUDGETS,
  MATCH_GOALS,
  MATCH_LEVELS,
  MATCH_PRIORITIES,
} from "@/lib/match";

type Answers = {
  level?: string;
  budget?: string;
  goal?: string;
  dorm: boolean;
  district?: string;
  near?: string;
  priority?: string;
};

const STEPS = ["level", "budget", "goal", "where", "priority"] as const;
type Step = (typeof STEPS)[number];

function Choice({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
        selected
          ? "border-gold-foreground/50 bg-gold-soft"
          : "border-line-strong bg-surface hover:border-foreground"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          selected ? "border-foreground bg-foreground text-surface" : "border-subtle"
        }`}
      >
        {selected && <Icon name="check" className="size-3" strokeWidth={3.5} />}
      </span>
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
      </span>
    </button>
  );
}

/**
 * Five short questions, one per screen. Picking an answer moves on by
 * itself; "Back" goes to the previous question. Starts from the answers in
 * the URL, so "Change answers" on the results page keeps what was chosen.
 */
export function MatchQuiz({ districts }: { districts: { name: string; count: number }[] }) {
  const t = useTranslations("Match");
  const tPlace = useTranslations("Place");
  const router = useRouter();
  const params = useSearchParams();

  const [answers, setAnswers] = useState<Answers>(() => ({
    level: params.get("level") ?? undefined,
    budget: params.get("budget") ?? undefined,
    goal: params.get("goal") ?? undefined,
    dorm: params.get("dorm") === "true",
    district: params.get("district") ?? undefined,
    near: params.get("near") ?? undefined,
    priority: params.get("priority") ?? undefined,
  }));
  const [stepIndex, setStepIndex] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const step: Step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function finish(final: Answers) {
    const qs = new URLSearchParams();
    for (const key of ["level", "budget", "goal", "district", "near", "priority"] as const) {
      const value = final[key];
      if (value) qs.set(key, value);
    }
    if (final.dorm) qs.set("dorm", "true");
    router.push(`/match?${qs.toString()}`);
  }

  function choose(changes: Partial<Answers>, advance = true) {
    const next = { ...answers, ...changes };
    setAnswers(next);
    if (!advance) return;
    if (isLast) finish(next);
    else setStepIndex((i) => i + 1);
  }

  async function useMyLocation() {
    setLocating(true);
    setLocateError(null);
    try {
      const near = await requestNearParam();
      choose({ near, district: undefined }, false);
    } catch (error) {
      setLocateError(String(error));
    } finally {
      setLocating(false);
    }
  }

  const canContinue =
    (step === "level" && answers.level) ||
    (step === "budget" && answers.budget) ||
    (step === "goal" && answers.goal) ||
    step === "where" ||
    step === "priority";

  return (
    <div>
      {/* Progress as a route: one stop per question. Stops already passed can be clicked to go back. */}
      <ol className="flex items-center" aria-label={t("progress", { step: stepIndex + 1, total: STEPS.length })}>
        {STEPS.map((name, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={name} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!done}
                onClick={() => setStepIndex(i)}
                aria-current={current ? "step" : undefined}
                aria-label={t("progress", { step: i + 1, total: STEPS.length })}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-bold tabular-nums transition-colors ${
                  current
                    ? "border-gold-foreground/60 bg-gold text-gold-foreground"
                    : done
                      ? "border-accent bg-accent text-accent-foreground hover:bg-accent-hover"
                      : "border-line-strong bg-surface text-subtle"
                }`}
              >
                {done ? <Icon name="check" className="size-4" strokeWidth={3} /> : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <span aria-hidden className={`h-1.5 flex-1 ${done ? "bg-accent" : "bg-surface-muted"}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Keyed by step, so each new question slides in. */}
      <div key={step} className="pop-in">
        <h2 className="mt-7 font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
          {t(`q.${step}`)}
        </h2>
        <p className="mt-1.5 text-muted">{t(`qHint.${step}`)}</p>

        <div role="radiogroup" aria-label={t(`q.${step}`)} className="mt-5 space-y-2.5">
          {step === "level" &&
            MATCH_LEVELS.map((value) => (
              <Choice
                key={value}
                selected={answers.level === value}
                onClick={() => choose({ level: value })}
                title={t(`level.${value}`)}
                hint={t(`levelHint.${value}`)}
              />
            ))}

          {step === "budget" &&
            MATCH_BUDGETS.map((value) => (
              <Choice
                key={value}
                selected={answers.budget === value}
                onClick={() => choose({ budget: value })}
                title={t(`budget.${value}`)}
              />
            ))}

          {step === "goal" &&
            MATCH_GOALS.map((value) => (
              <Choice
                key={value}
                selected={answers.goal === value}
                onClick={() => choose({ goal: value })}
                title={t(`goal.${value}`)}
                hint={t(`goalHint.${value}`)}
              />
            ))}

          {step === "where" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line-strong bg-surface p-4">
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className={`chip ${answers.near ? "is-on" : ""}`}
                >
                  <Icon name="map-pin" className="size-4" />
                  {answers.near ? t("locationSet") : locating ? t("locating") : t("useLocation")}
                </button>
                {locateError && (
                  <p role="alert" className="mt-2 text-xs text-muted">
                    {t(`locateError.${locateError === "denied" ? "denied" : "unavailable"}`)}
                  </p>
                )}
                <p className="mt-3 text-xs text-subtle">{t("locationPrivacy")}</p>

                {districts.length > 0 && (
                  <label className="mt-4 block text-sm">
                    <span className="font-semibold text-foreground">{t("orDistrict")}</span>
                    <select
                      value={answers.district ?? ""}
                      onChange={(e) => choose({ district: e.target.value || undefined, near: undefined }, false)}
                      className="field mt-1.5 cursor-pointer"
                    >
                      <option value="">{t("anyDistrict")}</option>
                      {districts.map(({ name }) => (
                        <option key={name} value={name}>
                          {tPlace.has(name) ? tPlace(name) : name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface px-4 py-3.5 transition-colors hover:border-foreground has-checked:border-gold-foreground/50 has-checked:bg-gold-soft">
                <input
                  type="checkbox"
                  checked={answers.dorm}
                  onChange={(e) => choose({ dorm: e.target.checked }, false)}
                  className="mt-1 size-4 accent-[var(--foreground)]"
                />
                <span>
                  <span className="block font-semibold text-foreground">{t("needDorm")}</span>
                  <span className="mt-0.5 block text-sm text-muted">{t("needDormHint")}</span>
                </span>
              </label>
            </div>
          )}

          {step === "priority" &&
            MATCH_PRIORITIES.map((value) => (
              <Choice
                key={value}
                selected={answers.priority === value}
                onClick={() => choose({ priority: value })}
                title={t(`priority.${value}`)}
              />
            ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className={`btn-secondary ${stepIndex === 0 ? "invisible" : ""}`}
        >
          <Icon name="arrow-right" className="size-4 rotate-180" />
          {t("back")}
        </button>
        {(step === "where" || isLast || canContinue) && (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => (isLast ? finish(answers) : setStepIndex((i) => i + 1))}
            className="btn-primary"
          >
            {isLast ? (answers.priority ? t("seeMatches") : t("skipAndSee")) : t("next")}
            <Icon name="arrow-right" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
