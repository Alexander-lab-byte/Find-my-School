import Link from "next/link";

export function LoginPrompt({ title, message, next }: { title: string; message: string; next: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <p className="mt-2 text-zinc-500">{message}</p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="mt-4 inline-block text-accent underline underline-offset-4"
      >
        Log in
      </Link>
    </div>
  );
}
