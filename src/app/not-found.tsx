import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <p dir="rtl" lang="he" className="text-5xl text-brand-700 dark:text-brand-400">
        לא נמצא
      </p>
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Страница не найдена</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Такой страницы нет — возможно, она была удалена или адрес введён неверно.
      </p>
      <Link href="/" className="btn-primary mt-2">
        На главную
      </Link>
    </div>
  );
}
