export default function SchoolNotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        We couldn&apos;t find that school
      </h1>
      <p className="mt-2 text-zinc-500">
        It may have been removed, or the link might be out of date.
      </p>
      <a
        href="/search"
        className="mt-6 inline-block text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
      >
        Back to search
      </a>
    </div>
  );
}
