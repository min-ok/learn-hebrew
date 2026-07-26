"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { CheckCircleIcon } from "@/components/icons";

const inputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";

export function ResetPasswordClient({ defaultEmail }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сбросить пароль");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <p className="text-stone-800 dark:text-stone-200">Пароль изменён! Теперь можно войти с новым паролем.</p>
        <Link href="/login" className="btn-primary">
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Новый пароль</h1>
      <p className="mb-1 text-sm text-stone-600 dark:text-stone-400">
        Введите код из письма и придумайте новый пароль.
      </p>
      <p className="mb-6 text-sm text-stone-500 dark:text-stone-500">
        Не пришло? Проверьте папку «Спам».
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Новый пароль</label>
          <PasswordInput value={password} onChange={setPassword} required minLength={6} autoComplete="new-password" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Повторите пароль</label>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Сохраняем…" : "Сохранить новый пароль"}
        </button>
      </form>
    </div>
  );
}
