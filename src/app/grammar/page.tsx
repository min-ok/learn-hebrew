import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Level } from "@prisma/client";
import { LEVELS, formatLevel } from "@/lib/levels";

export const metadata: Metadata = {
  title: "Грамматика иврита — Иврит",
  description: "Темы по грамматике иврита по уровням — от основ до продвинутых конструкций.",
};

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const activeLevel = level && LEVELS.includes(level as Level) ? (level as Level) : undefined;

  const topics = await prisma.grammarTopic.findMany({
    where: activeLevel ? { level: activeLevel } : undefined,
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: { id: true, title: true, summary: true, level: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Грамматика иврита</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Темы по уровням — от основ до продвинутых конструкций.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/grammar"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition active:scale-95 ${
            !activeLevel
              ? "bg-brand-700 text-white"
              : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          }`}
        >
          Все уровни
        </Link>
        {LEVELS.map((lvl) => (
          <Link
            key={lvl}
            href={`/grammar?level=${lvl}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition active:scale-95 ${
              activeLevel === lvl
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            {formatLevel(lvl)}
          </Link>
        ))}
      </div>

      {topics.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">Для этого уровня пока нет тем.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={`/grammar/${topic.id}`}
                className="flex h-full flex-col gap-2 rounded-xl bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:bg-stone-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] active:scale-[0.99] dark:bg-stone-900 dark:shadow-black/20 dark:hover:bg-stone-800/70"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-stone-900 dark:text-stone-50">{topic.title}</h2>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                    {formatLevel(topic.level)}
                  </span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">{topic.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
