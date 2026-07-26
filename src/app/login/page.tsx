"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResent(false);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.code === "email_not_verified") {
      setNeedsVerification(true);
      return;
    }

    if (result?.code === "too_many_attempts") {
      setError("Слишком много попыток входа. Попробуйте позже.");
      return;
    }

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleResend() {
    setResent(false);
    await fetch("/api/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-50">Вход</h1>
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
            className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Пароль
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-brand-700 dark:text-brand-400">
              Забыли пароль?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {needsVerification && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <p>Email ещё не подтверждён.</p>
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="mt-2 inline-block font-medium underline underline-offset-2"
            >
              Ввести код подтверждения
            </Link>
            <button
              type="button"
              onClick={handleResend}
              className="mt-2 block font-medium underline underline-offset-2"
            >
              Отправить код ещё раз
            </button>
            {resent && <p className="mt-1 text-brand-700 dark:text-brand-400">Код отправлен.</p>}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-brand-700 dark:text-brand-400">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
