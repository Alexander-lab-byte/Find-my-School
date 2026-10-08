import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
        About Find My School
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        UX/UI people, come up for things here
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">How to use it</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted">
          <li>
            <Link href="/search" className="text-accent underline underline-offset-4">
              Search
            </Link>{" "}
            UX/UI people, come up for things here
          </li>
          <li>UX/UI people, come up for things here</li>
          <li>UX/UI people, come up for things here</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">How ratings work</h2>
        <p className="mt-3 leading-7 text-muted">
          UX/UI people, come up for things here
          <Link href="/my-reviews" className="text-accent underline underline-offset-4">
            UX/UI people, come up for things here
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">Reviews and moderation</h2>
        <p className="mt-3 leading-7 text-muted">
          UX/UI people, come up for things here
        </p>
      </section>
    </main>
  );
}
