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
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        {action && <div className="whitespace-nowrap">{action}</div>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const COLUMN_CLASSES = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

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
      className={`grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line ${COLUMN_CLASSES[columns]}`}
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
    <div className="whitespace-pre-line rounded-xl border border-line bg-surface p-5 text-sm leading-7 text-muted">
      {children}
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line-strong px-5 py-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}
