import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  const registerHref = next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to Find My School Mongolia to rate and review schools."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={registerHref} className="font-medium text-accent underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {error === "auth-callback-failed" && (
        <p role="alert" className="mb-6 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          That sign-in link didn&apos;t work or has expired. Please log in again.
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
