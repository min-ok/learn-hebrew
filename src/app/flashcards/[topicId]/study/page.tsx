import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudySession } from "@/components/study-session";
import { CheckCircleIcon } from "@/components/icons";

export default async function StudyPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) notFound();
  if (topic.userId !== session.user.id) redirect("/flashcards");

  const dueCards = await prisma.card.findMany({
    where: { topicId, dueDate: { lte: new Date() } },
    orderBy: { dueDate: "asc" },
    select: { id: true, front: true, back: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/flashcards/${topic.id}`} className="text-sm font-medium text-brand-700 dark:text-brand-400">
          ← {topic.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Изучение: {topic.name}</h1>
      </div>

      {dueCards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
          <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
          <p className="text-stone-700 dark:text-stone-300">На сегодня карточек для повторения нет.</p>
          <Link href={`/flashcards/${topic.id}`} className="text-sm font-medium text-brand-700 dark:text-brand-400">
            Вернуться к теме
          </Link>
        </div>
      ) : (
        <StudySession cards={dueCards} />
      )}
    </div>
  );
}
