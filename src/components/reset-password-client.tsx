"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { CheckCircleIcon } from "@/components/icons";

export function ResetPasswordClient({ token }: { token: string | null }) {
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
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сбросить пароль");
      return;
    }

    setDone(true);
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-stone-700 dark:text-stone-300">Ссылка неполная — не найден токен сброса пароля.</p>
        <Link href="/forgot-password" className="font-medium text-brand-700 dark:text-brand-400">
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <p className="text-stone-800 dark:text-stone-200">Пароль изменён! Теперь можно войти с новым паролем.</p>
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-50">Новый пароль</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full"
        >
          {loading ? "Сохраняем…" : "Сохранить новый пароль"}
        </button>
      </form>
    </div>
  );
}
