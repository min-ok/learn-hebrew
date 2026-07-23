import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCard } from "../actions";
import { CardItem } from "@/components/card-item";

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { cards: { orderBy: { createdAt: "desc" } } },
  });

  if (!topic) notFound();
  if (topic.userId !== session.user.id) redirect("/flashcards");

  const dueCount = topic.cards.filter((c) => c.dueDate <= new Date()).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/flashcards" className="text-sm font-medium text-brand-700 dark:text-brand-400">
          ← Все темы
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{topic.name}</h1>
          {topic.cards.length > 0 && (
            <Link
              href={`/flashcards/${topic.id}/study`}
              className="btn-primary btn-sm"
            >
              Учить {dueCount > 0 ? `(${dueCount})` : ""}
            </Link>
          )}
        </div>
      </div>

      <form
        action={createCard.bind(null, topic.id)}
        className="grid gap-2 rounded-xl bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          name="front"
          required
          placeholder="Слово на иврите"
          dir="rtl"
          lang="he"
          className="rounded-lg border border-stone-300 px-3 py-2 text-right text-lg text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />
        <input
          name="back"
          required
          placeholder="Перевод на русский"
          className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />
        <button type="submit" className="btn-primary btn-sm">
          Добавить
        </button>
      </form>

      {topic.cards.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          В этой теме пока нет карточек — добавьте первую выше.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {topic.cards.map((card) => (
            <CardItem
              key={card.id}
              card={{ ...card, dueDate: card.dueDate.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
