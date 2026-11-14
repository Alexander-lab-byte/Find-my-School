import Link from "next/link";
import type { SchoolType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { TYPE_FILL } from "@/components/common/Badge";
import { SCHOOL_TYPES } from "@/lib/labels";
import { MATCH_LEVELS } from "@/lib/match";

const LINE_TEXT: Record<SchoolType, string> = {
  PUBLIC: "text-accent",
  PRIVATE: "text-tone-private",
  INTERNATIONAL: "text-tone-intl",
};

/**
 * The homepage's way in, drawn as a route map. The three stops are the
 * stages of school (each opens the list for that stage); the three lines
 * are the kinds of school (each opens that kind), all running to the same
 * destination. It replaces the old shortcut chips and "browse by type" cards.
 */
export function PathMap({ typeCounts }: { typeCounts: Partial<Record<SchoolType, number>> }) {
  const t = useTranslations("Home");
  const tMatch = useTranslations("Match");
  const tCommon = useTranslations("Common");
  const tType = useTranslations("SchoolTypePlural");
  const tTypeDescription = useTranslations("SchoolTypeDescription");

  return (
    <section aria-labelledby="path-title" className="plate p-4 text-foreground shadow-[var(--shadow-pop)] sm:p-6">
      <h2 id="path-title" className="font-display text-base font-semibold text-foreground">
        {t("pathTitle")}
      </h2>

      {/* Everything left of the yellow destination bar shares one 3-column grid, so stops line up. */}
      <div className="relative mt-4 pr-12 sm:pr-14">
        <ul className="grid grid-cols-3" aria-label={t("pathStages")}>
          {MATCH_LEVELS.map((level) => (
            <li key={level} className="flex justify-center px-0.5">
              <Link
                href={`/search?level=${level}`}
                className="group flex min-h-11 flex-col items-center rounded-lg px-1.5 py-1 text-center transition-colors hover:bg-surface-muted"
              >
                <span className="text-[0.8125rem] font-bold leading-tight text-foreground group-hover:underline group-hover:underline-offset-4 sm:text-sm">
                  {tMatch(`level.${level}`)}
                </span>
                <span className="mt-0.5 text-xs text-muted">{tMatch(`levelHint.${level}`)}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-2 space-y-4" aria-label={t("pathLines")}>
          {SCHOOL_TYPES.map((type, index) => (
            <li key={type}>
              {/* The line itself: a bar with one stop per stage, running into the destination. */}
              <div aria-hidden className="relative -mr-12 grid h-5 grid-cols-3 pr-12 sm:-mr-14 sm:pr-14">
                <span
                  className={`route-draw absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-l-full ${TYPE_FILL[type]}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                />
                {MATCH_LEVELS.map((level, stop) => (
                  <span key={level} className="relative flex items-center justify-center">
                    <span
                      className={`stop-in size-4 rounded-full border-[3px] bg-surface ${LINE_TEXT[type]} border-current`}
                      style={{ animationDelay: `${350 + index * 120 + stop * 90}ms` }}
                    />
                  </span>
                ))}
              </div>
              <Link
                href={`/search?type=${type}`}
                className="group mt-1 flex min-h-11 flex-wrap items-baseline gap-x-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-muted"
              >
                <span className={`font-display text-[0.9375rem] font-semibold group-hover:underline group-hover:underline-offset-4 ${LINE_TEXT[type]}`}>
                  {tType(type)}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {tCommon("schoolCount", { count: typeCounts[type] ?? 0 })}
                </span>
                <span className="w-full text-xs leading-5 text-muted">{tTypeDescription(type)}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Where every line is heading. */}
        <div className="absolute inset-y-0 right-0 flex w-10 flex-col items-center justify-center gap-2 rounded-xl bg-gold text-gold-foreground sm:w-11">
          <Icon name="graduation" className="size-5" />
          <span className="text-xs font-bold [writing-mode:vertical-rl]">{t("pathGoal")}</span>
        </div>
      </div>
    </section>
  );
}
