import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBubble } from "@/components/compare/CompareBubble";
import { HoloTracker } from "@/components/common/HoloTracker";
import "./globals.css";

// Both faces ship Cyrillic, so Mongolian text renders in the same type as English.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

// Wide display face for headings — the "night city" signage look.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "800"],
});

// Monospace for coordinates, counts and small data labels.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
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
      className={`${manrope.variable} ${unbounded.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <CompareBubble />
          <HoloTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
