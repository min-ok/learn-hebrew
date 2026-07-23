"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailIcon } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <MailIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Проверьте почту</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Если аккаунт с адресом <strong>{email}</strong> существует, мы отправили на него ссылку для сброса
          пароля.
        </p>
        <Link href="/login" className="mt-2 text-sm font-medium text-brand-700 dark:text-brand-400">
          Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Забыли пароль?</h1>
      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        Укажите email, с которым вы регистрировались — пришлём ссылку для сброса пароля.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full"
        >
          {loading ? "Отправляем…" : "Отправить ссылку"}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
        <Link href="/login" className="font-medium text-brand-700 dark:text-brand-400">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
