"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { VerifyEmailClient } from "@/components/verify-email-client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Не удалось зарегистрироваться");
      return;
    }

    setRegistered(true);
  }

  if (registered) {
    return <VerifyEmailClient defaultEmail={email} />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Регистрация</h1>
      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        Регистрация нужна только для создания карточек и отслеживания стрика — тексты доступны и без неё.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Имя
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Пароль
          </label>
          <PasswordInput
            id="password"
            required
            minLength={6}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full"
        >
          {loading ? "Регистрируем…" : "Зарегистрироваться"}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-brand-700 dark:text-brand-400">
          Войти
        </Link>
      </p>
    </div>
  );
}
