---
name: verify
description: How to build, launch and drive this Next.js app (hebrew learning site) for runtime verification.
---

# Verifying this app

Next.js 16 (App Router) + Prisma/PostgreSQL + NextAuth v5 (Credentials, JWT
sessions). Deploys to Netlify; DB is a real Postgres (Netlify DB/Neon/Supabase
in prod — see README), not SQLite/localStorage.

## Launch

```bash
npm run build        # optional, confirms production build compiles (no DB
                      # needed — every route is dynamic, none prerendered)
npm run dev &         # dev server on http://localhost:3000
```

Needs a reachable `DATABASE_URL` (Postgres) in `.env` before `dev`/`migrate`/
`seed` — `next build` alone doesn't need one. **No sudo/docker in this
sandbox**, but a local `postgres`/`initdb`/`pg_ctl` binary is present, so spin
up a throwaway local cluster instead of waiting on a hosted DB:

```bash
initdb -D .pgdata -U postgres --auth=trust --encoding=UTF8   # once
pg_ctl -D .pgdata -l pglog -o "-p 5433 -k /tmp" start
createdb -h 127.0.0.1 -p 5433 -U postgres hebrew
# .env: DATABASE_URL="postgresql://postgres@127.0.0.1:5433/hebrew"
npx prisma migrate deploy
npx prisma db seed
```

`.pgdata/` and `pglog` are gitignored — this is dev-only, throwaway. Stop
with `pg_ctl -D .pgdata stop`.

Re-seed sample texts (A1-C1) any time with `npx prisma db seed` (safe to
rerun — upserts by title, replaces that text's questions).

Schema changes: hand-author the migration with `prisma migrate diff
--from-empty --to-schema-datamodel prisma/schema.prisma --script` (works
without a live DB) if you can't reach one yet, otherwise plain `prisma
migrate dev`.

## Driving it with a real browser

No `@playwright/test` in deps by default — install ad hoc when verifying:

```bash
npm install -D playwright
npx playwright install chromium   # NOTE: --with-deps fails, no sudo in this env.
                                   # Plain install works fine on this box.
```

Write the driver script **inside the project directory** (e.g.
`./verify.js`), not under `/tmp` — `node` resolves `require("playwright")`
relative to the script's own path, and `/tmp` scripts won't see this
project's `node_modules`. Run with `node ./verify.js`, then delete it and
`npm uninstall playwright` when done — it's not a real project dependency.

## Key flows worth exercising

- Register (`/register`) → **no longer auto-signs in.** Shows a "Проверьте
  почту" screen instead. Without `RESEND_API_KEY` set, the verification link
  is only printed to the server console (grep the dev-server output for
  `verify-email?token=`) — that's expected in local dev, not a bug.
- Login before verifying → blocked. `signIn(...)` result has `.code ===
  "email_not_verified"` (not `.error` — check `.code` specifically), page
  shows a "письмо отправлено повторно" resend flow.
- Open the verification link → `/verify-email?token=...` is a GET page that
  does *not* auto-consume the token (avoids email-scanner prefetch
  false-positives) — it shows a button; click it to actually POST
  `/api/verify-email` and mark `emailVerified`. Token is single-use, deleted
  after success.
- After verifying → login works, session created.
- Levels are narrowed to just A1/A2/B1 in the `Level` enum (B2/C1 dropped
  site-wide, both from `HebrewText` and `GrammarTopic` — see the
  `remove_b2_c1_levels` migration). The UI never shows raw "A1" strings —
  `src/lib/levels.ts` maps them to ulpan-style labels (Алеф/Бет/Гимель) via
  `formatLevel()`/`LEVEL_LABELS`; `LEVELS` there is the single source of
  truth for which levels exist, don't hardcode `["A1","A2","B1","B2","C1"]`
  anywhere else.
- Grammar seed data lives in three per-level files —
  `prisma/grammar-data-a1.ts` / `-a2.ts` / `-b1.ts` (no more
  `grammar-data.ts`/`grammar-data-2.ts`, both deleted) — each exporting an
  already-ordered array; `prisma/seed.ts` concatenates them in that order
  and assigns `order` by array index. Reordering topics means reordering
  the array, not editing an `order` field by hand.
- Text-to-speech: a 🔊 `SpeakButton` next to Hebrew examples in
  `GrammarContent`, vocab items, and the full text on `/texts/[id]` calls
  `/api/tts?text=...` (Google Cloud TTS, `GOOGLE_TTS_API_KEY`). Without the
  key it 501s and the button just does nothing visible — that's expected
  in this sandbox (no key configured), not a bug.
- `/texts?level=A1` (and other levels) → open a text → RTL Hebrew content
  renders right-aligned, "Показать перевод" toggles Russian translation.
  Comprehension quiz exercise types per text (`QuestionType` enum) now
  **vary by text, not all 4 always present** — MULTIPLE_CHOICE is always
  there, but TRUE_FALSE/FILL_BLANK/ORDERING differ per text (like British
  Council reading exercises). Don't assume a fixed count/type mix when
  testing — read the seeded text's questions first. Types: MULTIPLE_CHOICE
  (radios), TRUE_FALSE (Правда/Ложь buttons, Hebrew statement), FILL_BLANK
  (text `input[type=text]`, prompt has a `___` placeholder split
  client-side), ORDERING (tap-to-build word order — `button:text-is("word")`
  in the pool, tap again in the answer strip to remove). Submit →
  per-question correct/wrong highlight + score. Registered users:
  submitting a quiz bumps the streak by 1 (idempotent same calendar day).
- `/grammar` and `/grammar?level=A1` (etc.) → list of `GrammarTopic` rows;
  `/grammar/[id]` renders `JSON.parse(content)` as `GrammarBlock[]`
  (paragraph/example/table/list) via `GrammarContent` — check tables render
  with horizontal scroll on narrow viewports, Hebrew cells use `dir="auto"`.
- `/flashcards` (anonymous) → shows a registration CTA instead of a
  redirect — that's intentional, not a bug.
- `/flashcards` (logged in) → create topic, open it, add a card
  (front = Hebrew, back = Russian), "Учить" → flip card → grade
  (Снова/Трудно/Хорошо/Легко) → SM-2 reschedules `dueDate`.
- Duplicate email / short password on `/register` → stays on page with
  inline error, no redirect.
- Password fields (`/login`, `/register`, `/profile`, `/reset-password`) have
  a show/hide eye toggle (`PasswordInput` component) — button has
  `aria-label`, not visible text.
- `/profile` (logged in, header name is a link there) → three independent
  sections: name (no password needed), password (current + new + confirm),
  email (new email + **current password**, doesn't touch `User.email` until
  the link is clicked — sets `pendingEmail` and shows "Ожидает
  подтверждения" with a cancel button). The confirmation link reuses
  `/verify-email?token=...`; grep server output for the *latest*
  `verify-email?token=` after submitting since both flows log the same
  pattern. Old email still works for login until the new one is confirmed.
- `/forgot-password` → always shows the same "Проверьте почту" message
  whether or not the email exists (no user enumeration) → grep server log
  for `reset-password?token=` → `/reset-password?token=...` sets a new
  password; old password stops working immediately, token is single-use.

## Gotchas

- `searchParams` and `params` are `Promise`s in this Next version (App
  Router) — server components must `await` them.
- Streak logic (`src/lib/streak.ts`) compares UTC calendar days, so it
  won't increment twice in one day regardless of how many texts/cards are
  completed.
- `next-auth` v5 credentials errors: only a thrown `CredentialsSignin`
  subclass (see `EmailNotVerifiedError` in `src/auth.ts`) surfaces a custom
  `.code` on the client `signIn()` result — a plain thrown `Error` gets
  swallowed to a generic error by design.
- After any `prisma/schema.prisma` edit, restart `npm run dev` — Turbopack
  doesn't reliably hot-reload a regenerated `@prisma/client` in
  `node_modules`, and Netlify's build cache had this exact problem once
  (stale client from before a schema change) — always run `prisma generate`
  as the first step of any build/deploy command, not just `migrate deploy`.
