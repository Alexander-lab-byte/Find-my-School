"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by school name, number, or district…"
        className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400"
        aria-label="Search schools"
      />
      <button
        type="submit"
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
