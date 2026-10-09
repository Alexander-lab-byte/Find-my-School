"use client";

import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "@/components/common/Icon";

const VARIANTS = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-line text-foreground hover:bg-surface-muted",
  danger: "border border-line text-danger hover:border-danger/40 hover:bg-danger-soft",
};

/** One moderation decision; `action` is a server action bound to one review or report. */
export function ModerationButton({
  action,
  label,
  icon,
  variant,
}: {
  action: () => Promise<void>;
  label: string;
  icon: IconName;
  variant: keyof typeof VARIANTS;
}) {
  return (
    <form action={action}>
      <Submit label={label} icon={icon} variant={variant} />
    </form>
  );
}

function Submit({ label, icon, variant }: { label: string; icon: IconName; variant: keyof typeof VARIANTS }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${VARIANTS[variant]}`}
    >
      <Icon name={icon} className={`size-4 ${pending ? "animate-pulse" : ""}`} />
      {label}
    </button>
  );
}
