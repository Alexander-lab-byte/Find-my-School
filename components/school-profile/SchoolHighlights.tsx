import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";

type SchoolHighlightsProps = {
  graduateDestinations: string[];
  notableAchievements: string[];
};

/**
 * Graduate destinations and achievements come from public sources and
 * haven't been confirmed by the schools, so they always carry this note.
 */
function UnverifiedNote({ text }: { text: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-subtle">
      <Icon name="info" className="size-3.5 shrink-0" />
      {text}
    </p>
  );
}

/** Outcomes and honours on a school's overview: where graduates go, and notable achievements. */
export function SchoolHighlights({ graduateDestinations, notableAchievements }: SchoolHighlightsProps) {
  const t = useTranslations("Highlights");

  if (graduateDestinations.length === 0 && notableAchievements.length === 0) return null;

  return (
    <div className="space-y-5">
      {graduateDestinations.length > 0 && (
        <section className="plate p-5 sm:p-6">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Icon name="graduation" className="size-5 text-accent" />
              {t("graduates")}
            </h2>
            <UnverifiedNote text={t("unverified")} />
            <ul className="mt-4 flex flex-wrap gap-2">
              {graduateDestinations.map((destination) => (
                <li
                  key={destination}
                  className="rounded-lg bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
                >
                  {destination}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {notableAchievements.length > 0 && (
        <section className="plate p-5 sm:p-6">
          <h2 className="section-title flex items-center gap-2">
            <Icon name="trophy" className="size-5 text-star" />
            {t("achievements")}
          </h2>
          <UnverifiedNote text={t("unverified")} />
          <ul className="mt-4 space-y-3">
            {notableAchievements.map((achievement) => (
              <li key={achievement} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-soft text-foreground">
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
