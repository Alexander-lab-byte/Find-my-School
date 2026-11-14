import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Commissioner, Geologica } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBubble } from "@/components/compare/CompareBubble";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Both faces carry the Mongolian Cyrillic letters (Ө, Ү live in the
// "cyrillic-ext" subset) and the tugrik sign, so Mongolian and English text
// render in the same type.
const text = Commissioner({
  variable: "--font-text",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

// Headings, school names and numbers.
const heading = Geologica({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    // Makes the share image and other metadata URLs absolute.
    metadataBase: new URL(siteUrl()),
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    openGraph: { siteName: t("siteName"), type: "website" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getTranslations("Common");

  return (
    <html
      lang={locale}
      className={`${text.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          {/* First stop for keyboard users: jump past the header. Hidden until focused. */}
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2.5 focus:font-semibold focus:text-gold-foreground"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <Footer />
          <CompareBubble />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
