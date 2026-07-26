import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Level } from "@prisma/client";
import { auth } from "@/auth";
import { LEVELS, formatLevel } from "@/lib/levels";
import { HomeIcon, SunIcon, CompassIcon, BookIcon, CheckCircleIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Тексты на иврите — Иврит",
  description: "Тексты на иврите по уровням с переводом, разбором слов и заданиями на понимание.",
};

const CARD_STYLES = [
  { Icon: HomeIcon, tone: "bg-brand-100 text-brand-700" },
  { Icon: SunIcon, tone: "bg-amber-100 text-amber-700" },
  { Icon: CompassIcon, tone: "bg-emerald-100 text-emerald-700" },
  { Icon: BookIcon, tone: "bg-violet-100 text-violet-700" },
];

export default async function TextsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; tag?: string; sort?: string }>;
}) {
  const { level, tag, sort } = await searchParams;
  const activeLevel = level && LEVELS.includes(level as Level) ? (level as Level) : undefined;

  const session = await auth();

  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } });
  const activeTag = tag && allTags.some((t) => t.name === tag) ? tag : undefined;
  const activeSort = sort === "unread" && session?.user ? "unread" : undefined;

  const [texts, readAttempts] = await Promise.all([
    prisma.hebrewText.findMany({
      where: {
        ...(activeLevel ? { level: activeLevel } : {}),
        ...(activeTag ? { tags: { some: { name: activeTag } } } : {}),
      },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, level: true, content: true, tags: { select: { name: true } } },
    }),
    session?.user
      ? prisma.textAttempt.findMany({
          where: { userId: session.user.id },
          select: { textId: true },
          distinct: ["textId"],
        })
      : Promise.resolve([]),
  ]);

  const readTextIds = new Set(readAttempts.map((a) => a.textId));
  if (activeSort === "unread") {
    texts.sort((a, b) => Number(readTextIds.has(a.id)) - Number(readTextIds.has(b.id)));
  }

  function withParam(key: "level" | "tag" | "sort", value: string | undefined) {
    const params = new URLSearchParams();
    if (key === "level" ? value : activeLevel) params.set("level", key === "level" ? value! : activeLevel!);
    if (key === "tag" ? value : activeTag) params.set("tag", key === "tag" ? value! : activeTag!);
    if (key === "sort" ? value : activeSort) params.set("sort", key === "sort" ? value! : activeSort!);
    const qs = params.toString();
    return qs ? `/texts?${qs}` : "/texts";
  }

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
          href={withParam("level", undefined)}
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
            href={withParam("level", lvl)}
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

      {session?.user && (
        <div>
          <Link
            href={withParam("sort", activeSort === "unread" ? undefined : "unread")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
              activeSort === "unread"
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            Сначала непрочитанные
          </Link>
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={withParam("tag", undefined)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
              !activeTag
                ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
            }`}
          >
            Все темы
          </Link>
          {allTags.map(({ name }) => (
            <Link
              key={name}
              href={withParam("tag", name)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
                activeTag === name
                  ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
              }`}
            >
              {name}
            </Link>
          ))}
        </div>
      )}

      {texts.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">По этому фильтру пока нет текстов.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {texts.map((text, i) => {
            const { Icon, tone } = CARD_STYLES[i % CARD_STYLES.length];
            const isRead = readTextIds.has(text.id);
            return (
              <li key={text.id}>
                <Link
                  href={`/texts/${text.id}`}
                  className={`flex h-full flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:bg-stone-900 dark:shadow-black/20 dark:hover:bg-stone-800/70 ${
                    isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isRead && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Прочитано
                        </span>
                      )}
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                        {formatLevel(text.level)}
                      </span>
                    </div>
                  </div>
                  <h2 className="font-semibold text-stone-900 dark:text-stone-50">{text.title}</h2>
                  <p dir="rtl" lang="he" className="line-clamp-2 text-right text-lg text-stone-700 dark:text-stone-300">
                    {text.content}
                  </p>
                  {text.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {text.tags.map((t) => (
                        <span
                          key={t.name}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
