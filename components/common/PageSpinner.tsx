export function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div
        role="status"
        aria-label="Loading"
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-accent dark:border-zinc-700"
      />
    </div>
  );
}
