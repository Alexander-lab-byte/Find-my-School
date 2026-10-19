"use client";

import { useState } from "react";
import { rootJustRendered } from "@/lib/page-motion";

/*
 * Switching tabs on a school profile (Overview, Reviews, Admissions…) turns
 * the content like the next page of a book. Skipped when the whole page has
 * just opened, because the root template is already playing its effect.
 */
export default function SchoolTabTemplate({ children }: { children: React.ReactNode }) {
  const [turn] = useState(() => !rootJustRendered());
  return <div className={turn ? "fx-turn" : undefined}>{children}</div>;
}
