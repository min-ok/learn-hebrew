"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/password-input";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:bg-stone-900 dark:shadow-black/20">
      <h2 className="font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none transition focus:border-brand-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary btn-sm self-start"
    >
      {loading ? "Сохраняем…" : children}
    </button>
  );
}

export function ProfileForms({
  name: initialName,
  email,
  pendingEmail: initialPendingEmail,
}: {
  name: string;
  email: string;
  pendingEmail: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <NameSection initialName={initialName} />
      <EmailSection email={email} initialPendingEmail={initialPendingEmail} />
      <PasswordSection />
    </div>
  );
}

function NameSection({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch("/api/profile/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сохранить имя");
      return;
    }

    setSaved(true);
  }

  return (
    <Section title="Имя">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Ваше имя">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            required
            className={inputClass}
          />
        </Field>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {saved && <p className="text-sm text-brand-700 dark:text-brand-400">Имя обновлено.</p>}
        <SubmitButton loading={loading}>Сохранить имя</SubmitButton>
      </form>
    </Section>
  );
}

function EmailSection({
  email,
  initialPendingEmail,
}: {
  email: string;
  initialPendingEmail: string | null;
}) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);

    const res = await fetch("/api/profile/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, currentPassword: password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось отправить код подтверждения");
      return;
    }

    setPendingEmail(newEmail.toLowerCase());
    setNewEmail("");
    setPassword("");
    setSent(true);
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    if (!pendingEmail) return;
    setConfirmError(null);
    setConfirming(true);

    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, code }),
    });

    setConfirming(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setConfirmError(data?.error ?? "Не удалось подтвердить email");
      return;
    }

    setPendingEmail(null);
    setCode("");
    setSent(false);
    router.refresh();
  }

  async function handleResend() {
    if (!pendingEmail) return;
    setResent(false);
    setResending(true);
    await fetch("/api/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    setResending(false);
    setResent(true);
  }

  async function handleCancel() {
    setCancelling(true);
    await fetch("/api/profile/email", { method: "DELETE" });
    setCancelling(false);
    setPendingEmail(null);
    setSent(false);
  }

  return (
    <Section title="Email">
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Текущий: <strong className="text-stone-900 dark:text-stone-100">{email}</strong>
      </p>

      {pendingEmail && (
        <div className="flex flex-col gap-3 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Ожидает подтверждения: <strong>{pendingEmail}</strong>
            </span>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="font-medium underline underline-offset-2 disabled:opacity-60"
            >
              Отменить
            </button>
          </div>
          <form onSubmit={handleConfirm} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Код из письма</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-center text-lg tracking-[0.4em] text-stone-900 outline-none focus:border-brand-600 dark:border-amber-800 dark:bg-stone-950 dark:text-stone-100"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={confirming}
              className="btn-primary btn-sm"
            >
              {confirming ? "Проверяем…" : "Подтвердить"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium underline underline-offset-2 disabled:opacity-60"
            >
              {resending ? "Отправляем…" : "Отправить код ещё раз"}
            </button>
          </form>
          {confirmError && <p className="text-red-700 dark:text-red-400">{confirmError}</p>}
          {resent && !confirmError && <p>Код отправлен повторно.</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Новый email">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Текущий пароль (для подтверждения)">
          <PasswordInput value={password} onChange={setPassword} required autoComplete="current-password" />
        </Field>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {sent && !error && (
          <p className="text-sm text-brand-700 dark:text-brand-400">
            Код подтверждения отправлен на новый адрес — введите его выше. Не пришло? Проверьте папку «Спам».
          </p>
        )}
        <SubmitButton loading={loading}>Сменить email</SubmitButton>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не удалось сменить пароль");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <Section title="Пароль">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Текущий пароль">
          <PasswordInput value={currentPassword} onChange={setCurrentPassword} required autoComplete="current-password" />
        </Field>
        <Field label="Новый пароль">
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Повторите новый пароль">
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {saved && <p className="text-sm text-brand-700 dark:text-brand-400">Пароль изменён.</p>}
        <SubmitButton loading={loading}>Сменить пароль</SubmitButton>
      </form>
    </Section>
  );
}
