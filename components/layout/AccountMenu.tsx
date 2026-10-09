"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/(auth)/actions";
import { Icon } from "@/components/common/Icon";

const ITEM =
  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted";

/** Signed-in user's menu: saved schools, own reviews, profile, admin queue, log out. */
export function AccountMenu({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on navigation, outside click, and Escape.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-32 truncate">{name}</span>
        <Icon name="chevron-down" className={`size-4 text-subtle transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.35)]"
        >
          <Link role="menuitem" href="/saved" className={ITEM}>
            <Icon name="bookmark" className="size-4 text-subtle" />
            {t("savedSchools")}
          </Link>
          <Link role="menuitem" href="/my-reviews" className={ITEM}>
            <Icon name="pencil" className="size-4 text-subtle" />
            {t("myReviews")}
          </Link>
          <Link role="menuitem" href="/profile" className={ITEM}>
            <Icon name="user" className="size-4 text-subtle" />
            {t("profile")}
          </Link>
          {isAdmin && (
            <Link role="menuitem" href="/admin/reports" className={ITEM}>
              <Icon name="shield" className="size-4 text-subtle" />
              {t("moderation")}
            </Link>
          )}
          <div className="my-1.5 border-t border-line" />
          <form action={signOut}>
            <button role="menuitem" type="submit" className={ITEM}>
              <Icon name="log-out" className="size-4 text-subtle" />
              {t("logOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
