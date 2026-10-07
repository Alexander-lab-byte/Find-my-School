import type { Curriculum } from "@prisma/client";
import { Icon, type IconName } from "@/components/common/Icon";
import { CURRICULUM_SHORT_LABELS } from "@/lib/labels";

type SchoolHighlightsProps = {
  foundedYear: number | null;
  studentTeacherRatio: string | null;
  curriculum: Curriculum[];
  graduateDestinations: string[];
  notableAchievements: string[];
};

function StatTile({
  icon,
  label,
  value,
  caption,
}: {
  icon: IconName;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-5">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-subtle">
        <Icon name={icon} className="size-4 text-accent" />
        {label}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {caption && <p className="mt-1 text-sm text-muted">{caption}</p>}
    </div>
  );
}

/** The "report card" at the top of a school's overview: key numbers, outcomes, honours. */
export function SchoolHighlights({
  foundedYear,
  studentTeacherRatio,
  curriculum,
  graduateDestinations,
  notableAchievements,
}: SchoolHighlightsProps) {
  const age = foundedYear ? new Date().getFullYear() - foundedYear : null;
  const programme = curriculum.map((c) => CURRICULUM_SHORT_LABELS[c]).join(" · ");
  const hasStats = foundedYear || studentTeacherRatio || programme;

  if (!hasStats && graduateDestinations.length === 0 && notableAchievements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {hasStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          {foundedYear && (
            <StatTile
              icon="calendar"
              label="Founded"
              value={String(foundedYear)}
              caption={age && age > 0 ? `${age} years of teaching` : undefined}
            />
          )}
          {studentTeacherRatio && (
            <StatTile
              icon="users"
              label="Student–teacher"
              value={studentTeacherRatio}
              caption="students per teacher"
            />
          )}
          {programme && (
            <StatTile
              icon="book"
              label="Programme"
              value={curriculum.length > 1 ? `${curriculum.length} tracks` : programme}
              caption={curriculum.length > 1 ? programme : undefined}
            />
          )}
        </div>
      )}

      {graduateDestinations.length > 0 && (
        <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent-soft"
          />
          <div className="relative">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
              <Icon name="graduation" className="size-5 text-accent" />
              Where graduates go
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {graduateDestinations.map((destination) => (
                <li
                  key={destination}
                  className="rounded-lg border border-line bg-background px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  {destination}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {notableAchievements.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Icon name="trophy" className="size-5 text-star" />
            Notable achievements
          </h2>
          <ul className="mt-4 space-y-3">
            {notableAchievements.map((achievement) => (
              <li key={achievement} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-star/15 text-star">
                  <Icon name="medal" className="size-4" />
                </span>
                <span className="pt-0.5 text-sm leading-6 text-foreground">{achievement}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
