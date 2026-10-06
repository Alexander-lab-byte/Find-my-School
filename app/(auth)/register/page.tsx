import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeNextPath } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Create an account"
      description="Join Find My School Mongolia to rate and review schools. It's free."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-accent underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
