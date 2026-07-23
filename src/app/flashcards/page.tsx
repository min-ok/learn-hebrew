import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTopic } from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { deleteTopic } from "./actions";
import { LayersIcon } from "@/components/icons";

export default async function FlashcardsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-10 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
        <LayersIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
          Карточки доступны после регистрации
        </h1>
        <p className="max-w-md text-stone-600 dark:text-stone-400">
          Создавайте свои темы, добавляйте карточки и учите их по методу интервального
          повторения. Это бесплатно и займёт минуту.
        </p>
        <div className="flex gap-3">
          <Link href="/register" className="btn-primary">
            Зарегистрироваться
          </Link>
          <Link href="/login" className="btn-secondary">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cards: true } },
      cards: { where: { dueDate: { lte: new Date() } }, select: { id: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Мои темы</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Создавайте темы, наполняйте их карточками и учите слова.
        </p>
      </div>

      <form action={createTopic} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Название новой темы"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        <button
          type="submit"
          className="btn-primary btn-sm"
        >
          Добавить
        </button>
      </form>

      {topics.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          Тем пока нет — создайте первую, чтобы начать добавлять карточки.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 hover:bg-stone-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] dark:bg-stone-900 dark:shadow-black/20 dark:hover:bg-stone-800/70"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/flashcards/${topic.id}`} className="font-semibold text-stone-900 hover:text-brand-700 dark:text-stone-50 dark:hover:text-brand-400">
                  {topic.name}
                </Link>
                <DeleteButton action={deleteTopic.bind(null, topic.id)} confirmMessage="Удалить тему и все её карточки?" />
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {topic._count.cards} {pluralizeCards(topic._count.cards)}
                {topic.cards.length > 0 && (
                  <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                    {topic.cards.length} к повторению
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/flashcards/${topic.id}`}
                  className="btn-secondary btn-sm"
                >
                  Открыть
                </Link>
                {topic._count.cards > 0 && (
                  <Link
                    href={`/flashcards/${topic.id}/study`}
                    className="btn-primary btn-sm"
                  >
                    Учить
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pluralizeCards(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "карточка";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "карточки";
  return "карточек";
}
