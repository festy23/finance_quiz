# Квиз-платформа (finance + matstat)

Платформа квиз-тренажёров. Frontend — Vite + React (SPA), backend — Vercel serverless-функции (`/api`), хранилище — Neon Postgres. **Авторизация только через Telegram** (deep-link бот). Каждый квиз — самодостаточный контент-модуль; прогресс пользователя разделён по `quiz_id`.

## Архитектура

- `src/` — SPA (React 18). `Root` роутит каталог (`/`) ↔ квиз (`/<quizId>`). Контент квиза грузится с `/api/content?quiz=<id>`, прогресс — с `/api/progress?quiz=<id>`.
- `api/` — serverless-функции (Node, ESM):
  - `quizzes.js` — каталог квизов; `content.js` — контент одного квиза.
  - `_data/registry.js` — реестр квизов; `_data/<quizId>/manifest.js` — манифест квиза (бренд, акцент, фичи, топики, вопросы, словарь, ачивки).
  - `auth/*` — вход через Telegram (сессия в httpOnly-cookie, JWT), quiz-agnostic.
  - `progress.js` · `attempts.js` · `tradetest-result.js` — прогресс пользователя по конкретному квизу (сервер-авторитетный пересчёт).
  - `_lib/` — db (Neon), auth, telegram, quiz-хелперы (`scoreAttempt`), schema.sql.
- `test/` — unit-тесты (Vitest).

### Как добавить новый квиз
1. Создать `api/_data/<id>/{questions.js, glossary.js, achievements.js, manifest.js}`.
2. Зарегистрировать манифест в `api/_data/registry.js`.
3. (Опционально) добавить viz в `src/components/viz/` и подмешать в `src/components/viz/index.js`.
Никаких изменений в БД-схеме не требуется — namespacing по `quiz_id` уже общий.

Подробный план реализации: `docs/superpowers/plans/2026-06-18-multi-quiz-platform.md`.

## Локальная разработка

```bash
npm install
npm test          # 13 тестов
npm run build     # продакшен-сборка в dist/
npm run dev       # фронтенд на :5173 (API — через vercel dev, см. ниже)
```

Для работы API локально нужен `vercel dev` (поднимает фронт + `/api/*` вместе на :3000) и заполненный `.env` (см. `.env.example`).

## Деплой на Vercel (runbook)

### 1. Создать Telegram-бота
1. Напишите [@BotFather](https://t.me/BotFather) → `/newbot` → задайте имя и username (например `kvanta_quiz_bot`).
2. Сохраните **токен** (`123456:ABC-...`) и **username** бота.

### 2. Подключить Neon Postgres
Vercel Dashboard → проект → **Storage / Marketplace → Neon → Connect**. Это добавит `DATABASE_URL` в окружение.

### 3. Переменные окружения
Сгенерируйте секрет сессии:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Добавьте переменные (CLI или Dashboard) во все окружения (production/preview/development):
```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_BOT_USERNAME
vercel env add VITE_TELEGRAM_BOT_USERNAME   # = username без @
vercel env add JWT_SECRET                    # значение из команды выше
# DATABASE_URL добавляется интеграцией Neon автоматически
```

### 4. Применить схему БД
```bash
vercel env pull .env       # подтянуть DATABASE_URL локально
npm run migrate            # создаёт таблицы в Neon
```

### 5. Задеплоить
```bash
npm i -g vercel@latest
vercel link
vercel --prod              # печатает production-URL
```

### 6. Привязать домен к боту (обязательно для Login Widget)
@BotFather → `/setdomain` → выбрать бота → отправить домен деплоя **без https://** (например `kvanta-quiz.vercel.app`). Без этого кнопка входа не отрисуется.

### 7. Проверка
Откройте production-URL → «Log in with Telegram» → вход → дашборд с именем из Telegram. Пройдите квиз, обновите страницу — попытка должна сохраниться в «Истории». `GET /api/progress` без cookie должен отдавать 401.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота (серверная проверка подписи виджета) |
| `TELEGRAM_BOT_USERNAME` | username бота (серверный) |
| `VITE_TELEGRAM_BOT_USERNAME` | username бота (встраивается в виджет на фронте) |
| `JWT_SECRET` | подпись сессионного JWT |
| `DATABASE_URL` | строка подключения Neon Postgres |
