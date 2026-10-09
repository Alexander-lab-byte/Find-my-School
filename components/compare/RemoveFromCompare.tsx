"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCompare } from "@/lib/useCompare";

export function RemoveFromCompare({ id, remainingIds }: { id: string; remainingIds: string[] }) {
  const t = useTranslations("Compare");
  const router = useRouter();
  const { remove } = useCompare();

  return (
    <button
      type="button"
      onClick={() => {
        remove(id);
        router.replace(remainingIds.length ? `/compare?ids=${remainingIds.join(",")}` : "/compare");
      }}
      className="mt-2 text-xs font-medium text-muted underline-offset-4 hover:text-accent hover:underline"
    >
      {t("remove")}
    </button>
  );
}
