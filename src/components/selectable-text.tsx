"use client";

import { useEffect, useRef, useState } from "react";

const HEBREW_RE = /[֐-׿]/;

type Popup = {
  text: string;
  x: number;
  y: number;
  status: "loading" | "done" | "error";
  translation?: string;
};

export function SelectableText({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, string>());
  const [popup, setPopup] = useState<Popup | null>(null);

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

  return (
    <div ref={containerRef} className={className}>
      {children}
      {popup && (
        <div
          role="tooltip"
          className="fixed z-50 max-w-64 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-stone-900 px-3 py-1.5 text-center text-sm text-white shadow-lg"
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.status === "loading" && <span className="text-stone-300">Перевод…</span>}
          {popup.status === "error" && <span className="text-stone-300">Перевод недоступен</span>}
          {popup.status === "done" && popup.translation}
          <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-stone-900" />
        </div>
      )}
    </div>
  );
}
