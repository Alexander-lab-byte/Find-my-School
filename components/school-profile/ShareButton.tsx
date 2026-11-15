"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Send a school to a partner or grandparent: the phone's share sheet, or copy the link. */
export function ShareButton({ name }: { name: string }) {
  const t = useTranslations("Profile");
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: t("shareText"), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* the person closed the share sheet */
    }
  }

  return (
    <button type="button" onClick={share} className="btn-sm btn-secondary" aria-live="polite">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {copied ? t("copied") : t("share")}
    </button>
  );
}
