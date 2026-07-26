import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Иврит",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-12 text-stone-700 dark:text-stone-300">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Политика конфиденциальности</h1>
      <p className="text-sm text-stone-500 dark:text-stone-500">Последнее обновление: 27 июля 2026</p>

      <p>
        Этот сайт — некоммерческий учебный проект для изучения иврита. Мы собираем минимум данных, необходимых
        для работы аккаунта и обучения.
      </p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Какие данные мы храним</h2>
      <ul className="list-inside list-disc space-y-1">
        <li>Имя и email, указанные при регистрации</li>
        <li>Пароль — в виде необратимого хеша, не в открытом виде</li>
        <li>Прогресс обучения: карточки, результаты тестов по текстам</li>
      </ul>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Как используются данные</h2>
      <p>
        Email используется только для входа, подтверждения регистрации, сброса пароля и ответа на обращения в
        поддержку. Мы не продаём и не передаём ваши данные третьим лицам.
      </p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Озвучка и перевод</h2>
      <p>
        Когда вы нажимаете кнопку озвучки или перевода, соответствующий текст на иврите отправляется во внешний
        API (Google Cloud Text-to-Speech и сервис перевода) для получения аудио или перевода. Эти запросы не
        связываются с вашим аккаунтом на стороне провайдера и не используются нами для чего-либо, кроме показа
        результата вам.
      </p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Аналитика</h2>
      <p>
        Сайт использует Vercel Analytics для агрегированной, обезличенной статистики посещений (без cookies и без
        отслеживания конкретного пользователя между сайтами).
      </p>

      <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Удаление данных</h2>
      <p>
        Чтобы удалить аккаунт и все связанные данные, напишите на{" "}
        <a className="underline underline-offset-2" href="mailto:kirill.108.j@gmail.com">
          kirill.108.j@gmail.com
        </a>{" "}
        или через страницу{" "}
        <a className="underline underline-offset-2" href="/support">
          Поддержка
        </a>
        .
      </p>
    </div>
  );
}
