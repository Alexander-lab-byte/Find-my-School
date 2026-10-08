import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeNextPath((await searchParams).next);

  return (
    <AuthCard
      title="Log in"
      description="Welcome back to Find My School Mongolia."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent underline underline-offset-4">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
