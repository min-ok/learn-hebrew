"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangleIcon, Volume2Icon } from "@/components/icons";

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function handleClick() {
    if (state === "loading") return;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      return;
    }

    setState("loading");
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error("tts failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      setState("idle");
      void audio.play();
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      aria-label="Прослушать произношение"
      title="Прослушать произношение"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-100 active:scale-90 disabled:opacity-50 dark:text-brand-400 dark:hover:bg-brand-950 ${className ?? ""}`}
    >
      {state === "error" ? (
        <AlertTriangleIcon className="h-4 w-4" />
      ) : (
        <Volume2Icon className={`h-4 w-4 ${state === "loading" ? "animate-pulse" : ""}`} />
      )}
    </button>
  );
}
