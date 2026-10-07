"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If the Supabase project has email confirmation on, there's no
    // session yet — send them to check their inbox instead of the app.
    if (!data.session) {
      setCheckEmail(true);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="rounded-[var(--radius-card)] border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Check your email</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          We sent a confirmation link to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
