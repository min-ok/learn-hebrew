"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, MailIcon } from "@/components/icons";

export function VerifyEmailClient({ token }: { token: string | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!token) return;
    setStatus("loading");
    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось подтвердить email");
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-stone-700 dark:text-stone-300">Ссылка неполная — не найден токен подтверждения.</p>
        <Link href="/register" className="font-medium text-brand-700 dark:text-brand-400">
          Зарегистрироваться заново
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <p className="text-stone-800 dark:text-stone-200">Email подтверждён! Теперь можно войти.</p>
        <Link
          href="/login"
          className="btn-primary"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <MailIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
      <p className="text-stone-800 dark:text-stone-200">Нажмите, чтобы подтвердить свой email.</p>
      {status === "error" && error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={status === "loading"}
        className="btn-primary"
      >
        {status === "loading" ? "Подтверждаем…" : "Подтвердить email"}
      </button>
    </div>
  );
}
