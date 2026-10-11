import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Manrope, Onest } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBubble } from "@/components/compare/CompareBubble";
import "./globals.css";

// Both faces ship Cyrillic, so Mongolian text renders in the same type as English.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

// Display face for headings.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${onest.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <CompareBubble />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
