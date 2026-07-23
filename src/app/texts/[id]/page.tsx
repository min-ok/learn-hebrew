import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TranslationToggle } from "@/components/translation-toggle";
import { TextQuiz } from "@/components/text-quiz";
import { shuffle } from "@/lib/shuffle";
import type { QuizQuestion } from "@/lib/quiz-types";
import { formatLevel } from "@/lib/levels";
import { SpeakButton } from "@/components/speak-button";
import { SelectableText } from "@/components/selectable-text";

export default async function TextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const text = await prisma.hebrewText.findUnique({
    where: { id },
    include: {
      vocabulary: { orderBy: { order: "asc" } },
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!text) notFound();

  const quizQuestions: QuizQuestion[] = text.questions.map((q) => {
    switch (q.type) {
      case "MULTIPLE_CHOICE":
        return {
          id: q.id,
          type: "MULTIPLE_CHOICE",
          prompt: q.prompt,
          options: JSON.parse(q.options ?? "[]") as string[],
        };
      case "ORDERING":
        return {
          id: q.id,
          type: "ORDERING",
          prompt: q.prompt,
          items: shuffle(JSON.parse(q.options ?? "[]") as string[]),
        };
      case "TRUE_FALSE":
        return { id: q.id, type: "TRUE_FALSE", prompt: q.prompt };
      case "FILL_BLANK":
      default:
        return { id: q.id, type: "FILL_BLANK", prompt: q.prompt };
    }
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <Link href="/texts" className="text-sm font-medium text-brand-700 dark:text-brand-400">
          ← Все тексты
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">{text.title}</h1>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-400">
            {formatLevel(text.level)}
          </span>
        </div>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
        <div className="mb-2 flex justify-end">
          <SpeakButton text={text.content} />
        </div>
        <SelectableText>
          <p dir="rtl" lang="he" className="whitespace-pre-line text-right text-2xl leading-relaxed text-stone-900 dark:text-stone-100">
            {text.content}
          </p>
        </SelectableText>
        <p className="mt-3 text-right text-xs text-stone-400 dark:text-stone-600">
          Выделите слово или фразу, чтобы увидеть перевод
        </p>
      </section>

      <TranslationToggle translation={text.translation} />

      {text.vocabulary.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-50">Новые слова</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {text.vocabulary.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-4 py-2 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20"
              >
                <div className="flex items-center gap-1.5">
                  <SpeakButton text={item.hebrew} />
                  <span dir="rtl" lang="he" className="text-lg text-stone-900 dark:text-stone-100">
                    {item.hebrew}
                  </span>
                </div>
                <span className="text-stone-600 dark:text-stone-400">{item.translation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quizQuestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-50">
            Проверьте понимание текста
          </h2>
          <TextQuiz textId={text.id} questions={quizQuestions} />
        </section>
      )}
    </div>
  );
}
