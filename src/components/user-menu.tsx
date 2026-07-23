"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function UserMenu({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="hidden text-sm text-stone-600 transition hover:text-brand-700 hover:underline sm:inline dark:text-stone-400 dark:hover:text-brand-400"
      >
        {name}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        Выйти
      </button>
    </div>
  );
}
