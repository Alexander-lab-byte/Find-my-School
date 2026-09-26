import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Create an account
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Join Find My School Mongolia to rate and review schools.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
