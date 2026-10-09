"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/client";
import { SIGNUP_ROLES } from "@/lib/labels";

type ErrorKey = "invalidCode" | "rateLimited" | "sendFailed";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Passwordless sign-in: email → one-time code → signed in. Works for new
 * and returning users alike (Supabase creates the account on first code).
 * The email also contains a link, handled by /auth/callback, so the flow
 * still works if someone taps that instead of typing the code.
 */
export function EmailOtpForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const t = useTranslations("Auth");
  const tRole = useTranslations("Role");
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("PARENT");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<ErrorKey | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    setError(null);
    setIsBusy(true);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        ...(mode === "register" ? { data: { name: name.trim(), role } } : {}),
      },
    });
    setIsBusy(false);

    if (error) {
      setError(error.status === 429 ? "rateLimited" : "sendFailed");
      return;
    }
    setStep("code");
    setCode("");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsBusy(true);
    const { error } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setIsBusy(false);
      setError(error.status === 429 ? "rateLimited" : "invalidCode");
      return;
    }
    router.push(next);
    router.refresh();
  }

  const errorBox = error && (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
      {t(error)}
    </p>
  );

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="space-y-5">
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground">
          <p className="font-medium">{t("checkEmail")}</p>
          <p className="mt-0.5 text-muted">
            {t.rich("codeSent", {
              email: email.trim(),
              b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
            })}
          </p>
        </div>

        <div>
          <label htmlFor="otp" className="text-sm font-medium text-foreground">
            {t("codeLabel")}
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,10}"
            maxLength={10}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="field mt-1.5 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <p className="mt-1.5 text-xs text-subtle">{t("linkHint")}</p>
        </div>

        {errorBox}

        <button
          type="submit"
          disabled={isBusy || code.length < 6}
          className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {isBusy ? t("verifying") : t("verify")}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="font-medium text-muted hover:text-foreground"
          >
            {t("changeEmail")}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={isBusy || cooldown > 0}
            className="font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:text-subtle disabled:no-underline"
          >
            {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resend")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void sendCode();
      }}
      className="space-y-5"
    >
      {mode === "register" && (
        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-1.5"
          />
        </div>
      )}
      {mode === "register" && (
        <div>
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            {t("role")}
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="field mt-1.5"
          >
            {SIGNUP_ROLES.map((r) => (
              <option key={r} value={r}>
                {tRole(r)}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-describedby="email-hint"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mt-1.5"
        />
        <p id="email-hint" className="mt-1.5 text-xs leading-5 text-subtle">
          {t("schoolEmailHint")}
        </p>
      </div>

      {errorBox}

      <button
        type="submit"
        disabled={isBusy}
        className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {isBusy ? t("sending") : t("sendCode")}
      </button>
    </form>
  );
}
