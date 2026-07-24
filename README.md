# Иврит — сайт для изучения языка

Next.js 16 (App Router) + TypeScript + Tailwind, Prisma + PostgreSQL, NextAuth v5.

## Локальный запуск

1. Получите Postgres-базу — проще всего создать проект на [neon.tech](https://neon.tech) (бесплатный тариф, проект уже использует Neon serverless driver adapter) и скопировать connection string. Альтернатива — [supabase.com](https://supabase.com) или любой другой Postgres-хостинг.

2. Скопируйте `.env.example` в `.env` (если ещё не создан) и впишите `DATABASE_URL` и `AUTH_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Получите API-ключ [Resend](https://resend.com) (бесплатный тариф) для писем подтверждения email и обращений в поддержку, впишите в `RESEND_API_KEY`. Без ключа письма просто печатаются в консоль сервера — удобно для локальной разработки, но не для прода. Также впишите `SUPPORT_EMAIL` — куда падают сообщения из формы `/support`.

   Пока аккаунт Resend не подтвердил свой домен (resend.com/domains), он в testing-режиме и шлёт письма только на email владельца аккаунта — на другие адреса будет 403. Для полноценной работы (регистрация чужих пользователей, форма поддержки) нужно верифицировать домен и указать `EMAIL_FROM` с этого домена.

4. Получите API-ключ [Google Cloud Text-to-Speech](https://console.cloud.google.com) (включить "Cloud Text-to-Speech API" → создать API key), впишите в `GOOGLE_TTS_API_KEY` — это озвучка примеров на иврите (кнопка 🔊 в грамматике и текстах). Без ключа кнопка просто не срабатывает (`/api/tts` отвечает 501), остальной сайт работает как обычно.

5. Примените миграции и засейте тексты и грамматику:
   ```bash
   npm install
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. Запустите dev-сервер:
   ```bash
   npm run dev
   ```

## Деплой на Vercel

1. Запушьте репозиторий на GitHub, импортируйте его в Vercel ("Add New... → Project"). Next.js определяется автоматически, ничего дополнительно настраивать не нужно.
2. В настройках проекта (Settings → Environment Variables) добавьте:
   - `DATABASE_URL` — строка подключения к Postgres (Neon, см. выше);
   - `AUTH_SECRET` — сгенерированный секрет;
   - `RESEND_API_KEY` — ключ для отправки писем подтверждения email и сообщений из поддержки (иначе регистрация будет работать, но письма никто не получит);
   - `EMAIL_FROM` — по желанию, иначе используется `onboarding@resend.dev`;
   - `SUPPORT_EMAIL` — куда доставлять сообщения с `/support`;
   - `GOOGLE_TTS_API_KEY` — ключ Google Cloud Text-to-Speech для озвучки примеров (по желанию, без него кнопка 🔊 просто не срабатывает);
   - `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` — по желанию, аналитика.
3. Билд (`npm run build`) сам прогоняет `prisma migrate deploy` перед `next build` — миграции накатываются на каждый деплой, а `prisma generate` гоняется через `postinstall`, так что клиент Prisma всегда пересобран под актуальную схему.
4. `prisma db seed` в билд не входит (раньше это гонялось на каждый деплой и жрало build-minutes) — прогоните его вручную один раз после первого деплоя (или при изменении контента):
   ```bash
   npx prisma db seed
   ```
   с `DATABASE_URL`, указывающим на прод-базу (например, экспортировав его из `vercel env pull`).

## Структура

- `prisma/schema.prisma` — модели БД. Уровни (`Level`) — только `A1`/`A2`/`B1`; на сайте показываются под привычными ульпан-названиями Алеф/Бет/Гимель (`src/lib/levels.ts`), но в базе и коде остались короткие коды CEFR.
- `prisma/seed.ts` + `prisma/grammar-data-a1.ts`/`grammar-data-a2.ts`/`grammar-data-b1.ts` — тексты на иврите (Алеф–Гимель) с заданиями и темы грамматики, по одному файлу на уровень; порядок тем в каждом файле — это порядок изучения, показанный на `/grammar`.
- `src/app/texts` — раздел с текстами и заданиями на понимание (4 типа: выбор ответа, правда/ложь, вставить слово, порядок слов — набор варьируется от текста к тексту).
- `src/app/grammar` — раздел с разбором грамматики по уровням Алеф–Гимель.
- `src/lib/tts.ts` + `src/app/api/tts` + `src/components/speak-button.tsx` — озвучка примеров на иврите через Google Cloud Text-to-Speech (кнопка 🔊); без `GOOGLE_TTS_API_KEY` эндпоинт отвечает 501 и кнопка молча не срабатывает.
- `src/app/flashcards` — темы и карточки с интервальным повторением (SM-2).
- `src/lib/streak.ts` — начисление стрика.
- `src/lib/verification.ts` + `src/lib/email.ts` — подтверждение email (регистрация и смена email), сброс пароля, письма поддержки (через Resend).
- `src/app/support` — форма обратной связи, письмо уходит на `SUPPORT_EMAIL`.
- `src/app/profile` — смена имени/пароля/email; смена email требует текущий пароль и не применяется, пока не подтверждена ссылка на новый адрес (`User.pendingEmail`).
- `src/app/forgot-password` + `src/app/reset-password` — восстановление пароля по ссылке из письма.
- `src/components/page-transition.tsx` + анимации в `globals.css` — лёгкие fade/pop-переходы (уважают `prefers-reduced-motion`).
