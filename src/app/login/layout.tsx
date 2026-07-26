import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — Иврит",
  description: "Войдите в аккаунт, чтобы сохранять карточки и прогресс обучения.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
