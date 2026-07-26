"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Что-то пошло не так</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Произошла ошибка. Мы уже получили отчёт о ней — попробуйте обновить страницу.
      </p>
      <button onClick={reset} className="btn-primary mt-2">
        Попробовать снова
      </button>
    </div>
  );
}
