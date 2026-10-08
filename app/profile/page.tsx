import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { Badge } from "@/components/common/Badge";
import { Fact, FactGrid } from "@/components/school-profile/ProfileSection";
import { ROLE_LABELS, SIGNUP_ROLES } from "@/lib/labels";
import { updateProfile } from "@/app/profile/actions";

export const metadata = { title: "Your profile" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginPrompt
        title="Your profile"
        message="Log in to see and edit your profile."
        next="/profile"
      />
    );
  }

  const { saved, error } = await searchParams;
  const [reviewCount, savedCount] = await Promise.all([
    prisma.review.count({ where: { userId: user.id } }),
    prisma.savedSchool.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-foreground">Your profile</h1>
        <Badge tone={user.isVerified ? "verified" : "neutral"}>
          {user.isVerified ? "Verified " : ""}
          {ROLE_LABELS[user.role]}
        </Badge>
      </div>

      <div className="mt-6">
        <FactGrid columns={3}>
          <Fact label="Email">{user.email}</Fact>
          <Fact label="Reviews">{reviewCount}</Fact>
          <Fact label="Saved schools">{savedCount}</Fact>
        </FactGrid>
      </div>

      <form action={updateProfile} className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-5">
        {saved && <p className="text-sm text-emerald-700 dark:text-emerald-400">Profile saved.</p>}
        {error === "name" && (
          <p className="text-sm text-red-600 dark:text-red-400">Please enter a name.</p>
        )}

        <div>
          <label htmlFor="name" className="text-sm text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={60}
            defaultValue={user.name}
            className="mt-1 w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {user.role !== "ADMIN" && (
          <div>
            <label htmlFor="role" className="text-sm text-zinc-700 dark:text-zinc-300">
              I am a…
            </label>
            <select
              id="role"
              name="role"
              defaultValue={user.role}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent p-2.5 text-sm outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
            >
              {SIGNUP_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
