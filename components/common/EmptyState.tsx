import { Icon, type IconName } from "@/components/common/Icon";

/**
 * What a page shows when there is nothing to list yet: what's missing, why,
 * and the one action that fixes it (pass a button or link as children).
 */
export function EmptyState({
  icon,
  title,
  body,
  as: Heading = "h2",
  children,
}: {
  icon: IconName;
  title: string;
  body?: string;
  /** Use "h1" when this is the whole page (e.g. "log in to see this"). */
  as?: "h1" | "h2";
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Icon name={icon} className="size-5" />
      </span>
      <Heading className="section-title mt-4">{title}</Heading>
      {body && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
