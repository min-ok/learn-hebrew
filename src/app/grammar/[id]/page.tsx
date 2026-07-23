import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GrammarContent } from "@/components/grammar-content";
import type { GrammarBlock } from "@/lib/grammar-types";
import { formatLevel } from "@/lib/levels";

export default async function GrammarTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const topic = await prisma.grammarTopic.findUnique({ where: { id } });
  if (!topic) notFound();

  const blocks = JSON.parse(topic.content) as GrammarBlock[];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <Link href="/grammar" className="text-sm font-medium text-brand-700 dark:text-brand-400">
          ← Все темы грамматики
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{topic.title}</h1>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-400">
            {formatLevel(topic.level)}
          </span>
        </div>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{topic.summary}</p>
      </div>

      <GrammarContent blocks={blocks} />
    </div>
  );
}
