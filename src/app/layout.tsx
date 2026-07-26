import type { Metadata } from "next";
import { Inter, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { KnowledgeTree } from "@/components/knowledge-tree";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const rubikHebrew = Rubik({
  variable: "--font-hebrew",
  subsets: ["hebrew"],
});

export const metadata: Metadata = {
  title: "Иврит — изучение языка",
  description: "Тексты на иврите с переводом и карточки с интервальным повторением",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${interSans.variable} ${rubikHebrew.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Analytics />
        <SpeedInsights />
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="relative overflow-hidden py-4 text-center text-sm text-stone-500 dark:text-stone-500">
            <KnowledgeTree className="pointer-events-none absolute -bottom-16 left-1/2 hidden h-32 w-auto -translate-x-1/2 text-brand-200/50 sm:block" />
            <span className="relative">
              Изучение иврита · сделано для практики ·{" "}
              <Link href="/support" className="underline-offset-2 transition hover:text-brand-700 hover:underline dark:hover:text-brand-400">
                Поддержка
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="underline-offset-2 transition hover:text-brand-700 hover:underline dark:hover:text-brand-400">
                Конфиденциальность
              </Link>{" "}
              ·{" "}
              <Link href="/terms" className="underline-offset-2 transition hover:text-brand-700 hover:underline dark:hover:text-brand-400">
                Условия
              </Link>
            </span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
