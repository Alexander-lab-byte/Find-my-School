export const LOCALES = ["en", "mn"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Same cookie name next-intl's own routing uses, so a later move to
// /en and /mn URLs would keep visitors' choice.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
