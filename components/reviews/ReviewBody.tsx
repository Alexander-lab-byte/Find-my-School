"use client";

import { useEffect, useRef, useState } from "react";

export function ReviewBody({ text }: { text: string }) {
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
    <div className="mt-3">
      <p
        ref={ref}
        onClick={canToggle && !expanded ? () => setExpanded(true) : undefined}
        className={`whitespace-pre-line text-sm text-zinc-700 [overflow-wrap:anywhere] dark:text-zinc-300 ${
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
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
