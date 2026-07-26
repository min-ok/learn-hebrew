"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircleIcon, MailIcon } from "@/components/icons";

const inputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";

export function VerifyEmailClient({ defaultEmail }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось подтвердить email");
      return;
    }

    setDone(true);
  }

  async function handleResend() {
    if (!email) {
      setError("Сначала укажите email");
      return;
    }
    setResent(false);
    setResending(true);
    await fetch("/api/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResent(true);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <p className="text-stone-800 dark:text-stone-200">Email подтверждён! Теперь можно войти.</p>
        <Link href="/login" className="btn-primary">
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <MailIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Подтвердите email</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Введите код из письма, которое мы отправили вам на почту.
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-500">
          Не пришло? Проверьте папку «Спам».
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 text-left">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Код из письма</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            placeholder="000000"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-1 w-full">
          {loading ? "Проверяем…" : "Подтвердить"}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="text-sm font-medium text-brand-700 underline underline-offset-2 disabled:opacity-60 dark:text-brand-400"
      >
        {resending ? "Отправляем…" : "Отправить код ещё раз"}
      </button>
      {resent && <p className="text-sm text-brand-700 dark:text-brand-400">Код отправлен повторно.</p>}
    </div>
  );
}
