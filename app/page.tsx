import { HeroSearchBar } from "@/components/search/HeroSearchBar";

const LEVELS = ["Elementary", "Middle", "High", "K-12"];
const TYPES = ["Public", "Private", "International"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            Find My School Mongolia
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Search, compare, and read real reviews of schools across Ulaanbaatar and beyond.
          </p>
        </div>

        <HeroSearchBar />

        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {LEVELS.map((level) => (
            <span
              key={level}
              className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
            >
              {level}
            </span>
          ))}
          {TYPES.map((type) => (
            <span
              key={type}
              className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
            >
              {type}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
