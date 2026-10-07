// Shown inside the profile layout while switching between tabs.
export default function SchoolTabLoading() {
  return (
    <div aria-busy className="animate-pulse space-y-6">
      <div className="h-6 w-40 rounded bg-surface-muted" />
      <div className="h-40 rounded-xl bg-surface-muted" />
      <div className="h-6 w-32 rounded bg-surface-muted" />
      <div className="h-24 rounded-xl bg-surface-muted" />
    </div>
  );
}
