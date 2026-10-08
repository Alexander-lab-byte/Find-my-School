import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Join Find My School Mongolia to rate and review schools."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
