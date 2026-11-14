export default function SearchLoading() {
  return (
    <main aria-busy className="mx-auto w-full max-w-6xl animate-pulse px-4 py-8 sm:px-6 sm:py-10">
      <div className="skeleton h-10 w-64 max-w-full" />
      <div className="skeleton mt-3 h-4 w-96 max-w-full" />
      <div className="skeleton mt-5 h-12 rounded-xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
        <div className="plate hidden h-[480px] lg:block" />
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="plate flex items-center gap-4 p-4">
              <div className="skeleton size-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
              <div className="skeleton hidden h-4 w-24 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
