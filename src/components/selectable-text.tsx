"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { addCardFromSelection } from "@/app/flashcards/actions";
import { PlusIcon, CheckCircleIcon } from "@/components/icons";

const HEBREW_RE = /[֐-׿]/;

type Popup = {
  text: string;
  x: number;
  y: number;
  status: "loading" | "done" | "error";
  translation?: string;
};

type Topic = { id: string; name: string };

export function SelectableText({
  children,
  className,
  topics = [],
  isLoggedIn = false,
}: {
  children: React.ReactNode;
  className?: string;
  topics?: Topic[];
  isLoggedIn?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, string>());
  const [popup, setPopup] = useState<Popup | null>(null);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleSelectionEnd() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPopup(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        setPopup(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text || !HEBREW_RE.test(text)) {
        setPopup(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left + rect.width / 2, 60), window.innerWidth - 60);
      const y = rect.top;

      setAdded(false);

      const cached = cacheRef.current.get(text);
      if (cached !== undefined) {
        setPopup({ text, x, y, status: "done", translation: cached });
        return;
      }

      setPopup({ text, x, y, status: "loading" });

      fetch(`/api/translate?text=${encodeURIComponent(text)}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error ?? "Не удалось перевести текст");
          }
          return res.json() as Promise<{ translated: string }>;
        })
        .then(({ translated }) => {
          cacheRef.current.set(text, translated);
          setPopup((p) => (p && p.text === text ? { ...p, status: "done", translation: translated } : p));
        })
        .catch(() => {
          setPopup((p) => (p && p.text === text ? { ...p, status: "error" } : p));
        });
    }

    document.addEventListener("mouseup", handleSelectionEnd);
    document.addEventListener("touchend", handleSelectionEnd);
    return () => {
      document.removeEventListener("mouseup", handleSelectionEnd);
      document.removeEventListener("touchend", handleSelectionEnd);
    };
  }, []);

  useEffect(() => {
    function clearOnScroll() {
      setPopup(null);
    }
    window.addEventListener("scroll", clearOnScroll, true);
    return () => window.removeEventListener("scroll", clearOnScroll, true);
  }, []);

  function handleAdd() {
    if (!popup?.translation || !topicId) return;
    startTransition(async () => {
      const result = await addCardFromSelection(topicId, popup.text, popup.translation!);
      if (result.ok) setAdded(true);
    });
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
      {popup && (
        <div
          role="tooltip"
          className="fixed z-50 w-64 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-stone-900 px-3 py-2 text-center text-sm text-white shadow-lg"
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.status === "loading" && <span className="text-stone-300">Перевод…</span>}
          {popup.status === "error" && <span className="text-stone-300">Перевод недоступен</span>}
          {popup.status === "done" && (
            <>
              <div>{popup.translation}</div>
              {isLoggedIn && topics.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 border-t border-white/10 pt-2">
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="min-w-0 flex-1 rounded bg-white/10 px-1.5 py-1 text-xs text-white outline-none"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id} className="text-stone-900">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isPending || added}
                    className="shrink-0 rounded p-1 text-white transition hover:bg-white/10 disabled:opacity-60"
                    aria-label="Добавить в карточки"
                  >
                    {added ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
              {isLoggedIn && topics.length === 0 && (
                <div className="mt-2 border-t border-white/10 pt-2 text-xs text-stone-300">
                  <Link href="/flashcards" className="underline hover:text-white">
                    Создайте тему
                  </Link>
                  , чтобы добавлять слова в карточки
                </div>
              )}
            </>
          )}
          <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-stone-900" />
        </div>
      )}
    </div>
  );
}
