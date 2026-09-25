type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "verified";
};

const TONE_CLASSES = {
  neutral:
    "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  accent:
    "border-[#2F5A66]/25 bg-[#2F5A66]/10 text-[#2F5A66] dark:border-[#7EB0BD]/30 dark:bg-[#2F5A66]/20 dark:text-[#9FC7D1]",
  verified:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
