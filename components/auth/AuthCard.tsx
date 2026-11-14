import { LogoMark } from "@/components/layout/Logo";

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
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-md">
        <div className="plate p-6 sm:p-9">
          <LogoMark className="size-10" />
          <h1 className="page-title mt-5">{title}</h1>
          <p className="mt-2 leading-6 text-muted">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-5 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  );
}
