import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";

/**
 * Locale comes from the visitor's choice (cookie), else their browser
 * language, else English. URLs stay the same in both languages.
 */
async function resolveLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  if (/(^|,)\s*mn\b/i.test(acceptLanguage)) return "mn";

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Asia/Ulaanbaatar",
  };
});
