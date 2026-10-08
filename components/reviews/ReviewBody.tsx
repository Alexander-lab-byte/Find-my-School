"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/** Review text clamped to three lines, with "Show more" when it overflows. */
export function ReviewBody({ text }: { text: string }) {
  const t = useTranslations("Reviews");
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const observer = new ResizeObserver(() => {
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  const canToggle = overflowing || expanded;

  return (
    <div className="mt-4">
      <p
        ref={ref}
        onClick={canToggle && !expanded ? () => setExpanded(true) : undefined}
        className={`whitespace-pre-line text-sm leading-7 text-foreground wrap-anywhere ${
          expanded ? "" : "line-clamp-3"
        } ${canToggle && !expanded ? "cursor-pointer" : ""}`}
      >
        {text}
      </p>
      {canToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 text-sm font-medium text-accent hover:underline"
        >
          {expanded ? t("showLess") : t("showMore")}
        </button>
      )}
    </div>
  );
}
