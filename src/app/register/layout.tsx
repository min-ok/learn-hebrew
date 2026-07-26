import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация — Иврит",
  description: "Зарегистрируйтесь, чтобы создавать карточки и отслеживать прогресс обучения иврита.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
