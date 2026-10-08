"use client";

import { useRouter } from "next/navigation";
import { useCompare } from "@/lib/useCompare";

export function RemoveFromCompare({ id, remainingIds }: { id: string; remainingIds: string[] }) {
  const router = useRouter();
  const { remove } = useCompare();

  return (
    <button
      type="button"
      onClick={() => {
        remove(id);
        router.replace(remainingIds.length ? `/compare?ids=${remainingIds.join(",")}` : "/compare");
      }}
      className="mt-3 text-xs text-zinc-500 underline underline-offset-4 hover:text-accent"
    >
      Remove
    </button>
  );
}
