import Link from "next/link";
import type { SchoolCardData } from "@/lib/schools";
import { Badge, TYPE_TONE } from "@/components/common/Badge";
import { Icon } from "@/components/common/Icon";
import { SchoolMonogram } from "@/components/common/SchoolMonogram";
import { StarRating } from "@/components/common/StarRating";
import {
  CURRICULUM_SHORT_LABELS,
  LEVEL_LABELS,
  TYPE_LABELS,
  tuitionSummary,
} from "@/lib/labels";

export function SchoolCard({ school }: { school: SchoolCardData }) {
  const location = [school.district, school.aimagCity].filter(Boolean).join(", ");

  return (
    <Link
      href={`/school/${school.id}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_28px_-16px_rgb(0_0_0/0.22)]"
    >
      <div className="flex items-start gap-4">
        <SchoolMonogram name={school.nameEn} type={school.type} logoUrl={school.logoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
            {school.nameEn}
          </h3>
          {school.nameMn && <p className="mt-0.5 text-sm text-muted">{school.nameMn}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone={TYPE_TONE[school.type]}>{TYPE_LABELS[school.type]}</Badge>
        <Badge>{LEVEL_LABELS[school.level]}</Badge>
        {school.schoolNumber && !school.nameEn.includes(school.schoolNumber) && (
          <Badge>{school.schoolNumber}</Badge>
        )}
        {school.dormitory && <Badge>Dormitory</Badge>}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        <li className="flex items-center gap-2">
          <Icon name="map-pin" className="size-4 shrink-0 text-subtle" />
          <span className="truncate">{location}</span>
        </li>
        {school.curriculum.length > 0 && (
          <li className="flex items-center gap-2">
            <Icon name="book" className="size-4 shrink-0 text-subtle" />
            <span className="truncate">
              {school.curriculum.map((c) => CURRICULUM_SHORT_LABELS[c]).join(" · ")}
            </span>
          </li>
        )}
        {(school.type === "PUBLIC" || school.tuitionMinAnnual || school.tuitionMaxAnnual) && (
          <li className="flex items-center gap-2">
            <Icon name="wallet" className="size-4 shrink-0 text-subtle" />
            <span className="truncate">
              {tuitionSummary(school.type, school.tuitionMinAnnual, school.tuitionMaxAnnual)}
            </span>
          </li>
        )}
        {(school.foundedYear || school.studentTeacherRatio) && (
          <li className="flex items-center gap-2">
            <Icon name="calendar" className="size-4 shrink-0 text-subtle" />
            <span className="truncate">
              {[
                school.foundedYear && `Est. ${school.foundedYear}`,
                school.studentTeacherRatio && `${school.studentTeacherRatio} ratio`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </li>
        )}
      </ul>

      {school.graduateDestinations.length > 0 && (
        <div className="mt-4 rounded-lg bg-surface-muted px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-subtle">
            <Icon name="graduation" className="size-3.5" />
            Graduates go to
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-foreground">
            {school.graduateDestinations.slice(0, 3).join(", ")}
            {school.graduateDestinations.length > 3 && (
              <span className="whitespace-nowrap text-muted">
                {" "}
                +{school.graduateDestinations.length - 3} more
              </span>
            )}
          </p>
        </div>
      )}


      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <StarRating value={school.avgOverall} count={school.reviewCount} size="sm" />
          <Icon
            name="arrow-right"
            className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </div>
      </div>
    </Link>
  );
}
