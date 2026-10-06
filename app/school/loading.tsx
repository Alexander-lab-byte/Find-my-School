// Shown while a school profile (header + first tab) loads after clicking a card.
export default function SchoolProfileLoading() {
  return (
    <div aria-busy className="flex flex-1 animate-pulse flex-col">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
          <div className="h-4 w-24 rounded bg-surface-muted" />
          <div className="mt-6 flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="flex gap-5">
              <div className="size-16 shrink-0 rounded-xl bg-surface-muted sm:size-20" />
              <div className="space-y-3">
                <div className="h-5 w-40 rounded bg-surface-muted" />
                <div className="h-9 w-72 max-w-full rounded-lg bg-surface-muted" />
                <div className="h-5 w-56 rounded bg-surface-muted" />
              </div>
            </div>
            <div className="h-40 rounded-xl bg-surface-muted md:w-64" />
          </div>
        </div>
      </div>
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-5xl gap-6 px-4 py-4 sm:px-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-4 w-20 rounded bg-surface-muted" />
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-48 rounded-xl bg-surface-muted" />
      </div>
    </div>
  );
}
