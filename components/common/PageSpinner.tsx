export function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div
        role="status"
        aria-label="Loading"
        className="size-8 animate-spin rounded-full border-2 border-line border-t-accent"
      />
    </div>
  );
}
