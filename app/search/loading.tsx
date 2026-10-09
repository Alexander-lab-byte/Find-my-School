export default function SearchLoading() {
  return (
    <main aria-busy className="animate-pulse">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="h-3 w-20 rounded bg-surface-muted" />
          <div className="mt-3 h-9 w-64 rounded-lg bg-surface-muted" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-surface-muted" />
          <div className="mt-6 h-12 max-w-3xl rounded-xl bg-surface-muted" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden h-[480px] rounded-xl border border-line bg-surface lg:block" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-64 rounded-xl border border-line bg-surface p-5">
              <div className="flex gap-4">
                <div className="size-12 rounded-lg bg-surface-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-surface-muted" />
                  <div className="h-3 w-1/2 rounded bg-surface-muted" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-3 w-2/3 rounded bg-surface-muted" />
                <div className="h-3 w-1/2 rounded bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
