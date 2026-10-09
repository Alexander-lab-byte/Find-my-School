"use client";

import { useTranslations } from "next-intl";

/** Delete with a confirm step; `action` is a server action bound to one review. */
export function DeleteReviewButton({ action }: { action: () => Promise<void> }) {
  const t = useTranslations("MyReviews");

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(t("confirmDelete"))) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs font-medium text-muted underline-offset-4 transition-colors hover:text-danger hover:underline"
      >
        {t("delete")}
      </button>
    </form>
  );
}
