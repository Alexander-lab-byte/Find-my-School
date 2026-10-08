"use client";

export function DeleteReviewButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Delete this review? This can't be undone.")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs text-zinc-500 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
