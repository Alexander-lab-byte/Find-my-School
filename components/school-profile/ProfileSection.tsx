export function ProfileSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        {action && <div className="whitespace-nowrap">{action}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const COLUMN_CLASSES = {
  // A lone last cell spans the row, so an odd number of facts never leaves a hole.
  2: "sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2",
  3: "sm:grid-cols-3",
};

/** 3 columns when the facts fill whole rows of three, otherwise 2. */
export function factColumns(count: number): keyof typeof COLUMN_CLASSES {
  return count % 3 === 0 ? 3 : 2;
}

/**
 * A tidy grid of label/value pairs, e.g. tuition, ratio, deadline. Pick
 * `columns` so the number of facts fills whole rows — the 1px gaps are the
 * grid's background showing through, so an empty cell would show as a block.
 */
export function FactGrid({
  columns = 3,
  children,
}: {
  columns?: keyof typeof COLUMN_CLASSES;
  children: React.ReactNode;
}) {
  return (
    <dl
      className={`grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line ${COLUMN_CLASSES[columns]}`}
    >
      {children}
    </dl>
  );
}

export function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

/** Prose block for longer free-text fields (living conditions, entrance exams…). */
export function ProseCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-line reveal rounded-[1.75rem] border border-line bg-surface shadow-[var(--shadow-card)] p-5 text-sm leading-7 text-muted">
      {children}
    </div>
  );
}

/**
 * One quiet note listing what this profile is still missing, instead of a
 * "Not reported" row for every unknown field.
 */
export function IncompleteProfile({
  title,
  body,
  missing,
}: {
  title: string;
  body: string;
  missing: string[];
}) {
  if (missing.length === 0) return null;
  return (
    <div className="rounded-[1.25rem] border border-dashed border-line-strong bg-surface-muted/50 px-5 py-4 text-sm">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 leading-6 text-muted">{body}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {missing.map((label) => (
          <li key={label} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted">
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[1.25rem] border border-dashed border-line-strong px-5 py-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}
