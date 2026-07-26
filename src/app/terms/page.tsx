import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия использования — Иврит",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-12 text-stone-700 dark:text-stone-300">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Условия использования</h1>
      <p className="text-sm text-stone-500 dark:text-stone-500">Последнее обновление: 27 июля 2026</p>

      <p>Сайт предоставляется бесплатно, «как есть», для самостоятельного изучения иврита.</p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Использование сайта</h2>
      <ul className="list-inside list-disc space-y-1">
        <li>Регистрируясь, вы подтверждаете, что указанный email принадлежит вам</li>
        <li>Не допускается автоматизированный сбор данных с сайта (парсинг, боты) без согласования</li>
        <li>Учебные материалы могут содержать неточности — сайт не гарантирует полноту или безошибочность контента</li>
      </ul>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Ограничение ответственности</h2>
      <p>
        Автор не несёт ответственности за любые убытки, связанные с использованием сайта. Сервис может временно
        быть недоступен без предварительного уведомления.
      </p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Изменения условий</h2>
      <p>Условия могут обновляться по мере развития сайта. Дата последнего обновления указана вверху страницы.</p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Контакты</h2>
      <p>
        По любым вопросам:{" "}
        <a className="underline underline-offset-2" href="mailto:kirill.108.j@gmail.com">
          kirill.108.j@gmail.com
        </a>{" "}
        или страница{" "}
        <a className="underline underline-offset-2" href="/support">
          Поддержка
        </a>
        .
      </p>
    </div>
  );
}
