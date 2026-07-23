"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reviewCard } from "@/app/flashcards/actions";
import { CheckCircleIcon } from "@/components/icons";

type Card = { id: string; front: string; back: string };

const GRADES: { quality: 1 | 3 | 4 | 5; label: string; className: string }[] = [
  { quality: 1, label: "Снова", className: "bg-red-600 hover:bg-red-700" },
  { quality: 3, label: "Трудно", className: "bg-amber-600 hover:bg-amber-700" },
  { quality: 4, label: "Хорошо", className: "bg-brand-700 hover:bg-brand-800" },
  { quality: 5, label: "Легко", className: "bg-green-600 hover:bg-green-700" },
];

export function StudySession({ cards }: { cards: Card[] }) {
  const [queue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [isPending, startTransition] = useTransition();

  const current = queue[index];
  const done = index >= queue.length;

  function handleGrade(quality: 1 | 3 | 4 | 5) {
    if (!current) return;
    startTransition(async () => {
      await reviewCard(current.id, quality);
      setReviewed((r) => r + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
    });
  }

  if (done) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <p className="text-stone-700 dark:text-stone-300">Сессия завершена — повторено {reviewed} карточек.</p>
        <Link href="/flashcards" className="text-sm font-medium text-brand-700 dark:text-brand-400">
          К списку тем
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Карточка {index + 1} из {queue.length}
      </p>

      <div key={current.id} className="animate-fade-in-up w-full max-w-md [perspective:1200px]">
        <button
          onClick={() => setFlipped((f) => !f)}
          className={`relative min-h-56 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-white p-8 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] [backface-visibility:hidden] dark:bg-stone-900 dark:shadow-black/20">
            <span dir="rtl" lang="he" className="text-3xl font-medium text-stone-900 dark:text-stone-100">
              {current.front}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-600">Нажмите, чтобы увидеть перевод</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-brand-50 p-8 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-brand-950/40">
            <span dir="rtl" lang="he" className="text-lg text-stone-500 dark:text-stone-400">
              {current.front}
            </span>
            <span className="text-2xl font-medium text-stone-900 dark:text-stone-100">{current.back}</span>
          </div>
        </button>
      </div>

      {flipped ? (
        <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.quality}
              disabled={isPending}
              onClick={() => handleGrade(g.quality)}
              className={`animate-fade-in-up rounded-lg px-3 py-2 text-sm font-medium text-white transition active:scale-95 disabled:opacity-50 ${g.className}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="btn-primary"
        >
          Показать перевод
        </button>
      )}
    </div>
  );
}
