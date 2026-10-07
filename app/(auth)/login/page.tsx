import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Log in
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Welcome back to Find My School Mongolia.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
