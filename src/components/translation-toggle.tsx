"use client";

import { useState } from "react";

export function TranslationToggle({ translation }: { translation: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setVisible((v) => !v)}
        className="self-start rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        {visible ? "Скрыть перевод" : "Показать перевод"}
      </button>
      {visible && (
        <p className="animate-fade-in-up whitespace-pre-line rounded-xl bg-stone-100 p-4 text-stone-800 dark:bg-stone-900 dark:text-stone-200">
          {translation}
        </p>
      )}
    </div>
  );
}
