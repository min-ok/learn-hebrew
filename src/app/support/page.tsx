"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { CheckCircleIcon } from "@/components/icons";

export default function SupportPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName((prev) => prev || session.user.name || "");
      setEmail((prev) => prev || session.user.email || "");
    }
  }, [session]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Не удалось отправить сообщение");
      return;
    }

    setSent(true);
    setMessage("");
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <CheckCircleIcon className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Сообщение отправлено</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Мы ответим вам на <strong>{email}</strong> в ближайшее время.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 text-sm font-medium text-brand-700 dark:text-brand-400"
        >
          Написать ещё раз
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Поддержка</h1>
      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        Нашли баг, не работает текст или карточка, есть предложение? Напишите — мы читаем каждое сообщение.
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
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Email для ответа
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
        <div className="flex flex-col gap-1">
          <label htmlFor="message" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Сообщение
          </label>
          <textarea
            id="message"
            required
            minLength={10}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full"
        >
          {loading ? "Отправляем…" : "Отправить"}
        </button>
      </form>
    </div>
  );
}
