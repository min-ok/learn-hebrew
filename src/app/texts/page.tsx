import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Level } from "@prisma/client";
import { LEVELS, formatLevel } from "@/lib/levels";
import { HomeIcon, SunIcon, CompassIcon, BookIcon } from "@/components/icons";

const CARD_STYLES = [
  { Icon: HomeIcon, tone: "bg-brand-100 text-brand-700" },
  { Icon: SunIcon, tone: "bg-amber-100 text-amber-700" },
  { Icon: CompassIcon, tone: "bg-emerald-100 text-emerald-700" },
  { Icon: BookIcon, tone: "bg-violet-100 text-violet-700" },
];

export default async function TextsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const activeLevel = level && LEVELS.includes(level as Level) ? (level as Level) : undefined;

  const texts = await prisma.hebrewText.findMany({
    where: activeLevel ? { level: activeLevel } : undefined,
    orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, level: true, content: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Тексты на иврите</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Выберите уровень и почитайте текст с переводом, разбором слов и заданием на понимание.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/texts"
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
            href={`/texts?level=${lvl}`}
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

      {texts.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">Для этого уровня пока нет текстов.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {texts.map((text, i) => {
            const { Icon, tone } = CARD_STYLES[i % CARD_STYLES.length];
            return (
              <li key={text.id}>
                <Link
                  href={`/texts/${text.id}`}
                  className="flex h-full flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:bg-stone-900 dark:shadow-black/20 dark:hover:bg-stone-800/70"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                      {formatLevel(text.level)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-stone-900 dark:text-stone-50">{text.title}</h2>
                  <p dir="rtl" lang="he" className="line-clamp-2 text-right text-lg text-stone-700 dark:text-stone-300">
                    {text.content}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
