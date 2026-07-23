"use client";

import { useState } from "react";
import { updateCard, deleteCard } from "@/app/flashcards/actions";
import { DeleteButton } from "@/components/delete-button";

export function CardItem({
  card,
}: {
  card: { id: string; front: string; back: string; dueDate: string; repetitions: number };
}) {
  const [editing, setEditing] = useState(false);
  const isDue = new Date(card.dueDate) <= new Date();

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateCard(card.id, formData);
          setEditing(false);
        }}
        className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] ring-1 ring-brand-600 dark:bg-stone-900 dark:shadow-black/20"
      >
        <input
          name="front"
          defaultValue={card.front}
          required
          dir="rtl"
          lang="he"
          className="rounded-lg border border-stone-300 px-3 py-2 text-right text-lg text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />
        <input
          name="back"
          defaultValue={card.back}
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary btn-sm">
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn-secondary btn-sm"
          >
            Отмена
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
      <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
        <span dir="rtl" lang="he" className="text-lg text-stone-900 dark:text-stone-100">
          {card.front}
        </span>
        <span className="text-stone-600 dark:text-stone-400">{card.back}</span>
      </div>
      {isDue && card.repetitions > 0 && (
        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
          к повторению
        </span>
      )}
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-2 py-1 text-sm text-stone-600 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          Изменить
        </button>
        <DeleteButton action={deleteCard.bind(null, card.id)} confirmMessage="Удалить карточку?" />
      </div>
    </div>
  );
}
