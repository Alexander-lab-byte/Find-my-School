import { SkyClouds } from "@/components/common/SkyClouds";

/** Centered card shared by the log-in and sign-up pages. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <SkyClouds />
      <div className="w-full max-w-md">
        <div className="glass enter rounded-[2rem] p-7 shadow-[var(--shadow-lift)] sm:p-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  );
}
