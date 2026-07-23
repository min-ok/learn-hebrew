import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserMenu } from "@/components/user-menu";
import { StreakBadge } from "@/components/streak-badge";

const navItems = [
  { href: "/texts", label: "Тексты" },
  { href: "/grammar", label: "Грамматика" },
  { href: "/flashcards", label: "Карточки" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, currentStreak: true },
      })
    : null;

  return (
    <header className="sticky top-0 z-10 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur dark:bg-stone-950/90 dark:shadow-black/30">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-50">
          <span aria-hidden className="text-xs font-semibold tracking-widest text-brand-700 dark:text-brand-400">
            IL / HE
          </span>
          Иврит
        </Link>

        <nav className="order-3 flex w-full gap-1 sm:order-2 sm:w-auto sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-3 sm:order-3">
          {user ? (
            <>
              <StreakBadge streak={user.currentStreak} />
              <UserMenu name={user.name} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-2 py-1.5 text-sm font-medium text-stone-700 transition hover:text-brand-700 dark:text-stone-300 dark:hover:text-brand-400"
              >
                Войти
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
