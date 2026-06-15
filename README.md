# 67quant — тренажёр по финансам

Финансовый квиз-тренажёр. Frontend — Vite + React (SPA), backend — Vercel serverless-функции (`/api`), хранилище — Neon Postgres. **Авторизация только через Telegram** (deep-link бот).

## Архитектура

- `src/` — SPA (React 18). Контент квиза грузится с `/api/content`, прогресс — с `/api/progress`.
- `api/` — serverless-функции (Node, ESM):
  - `content.js` — отдаёт вопросы/словарь/трейд-тест.
  - `auth/telegram.js` · `auth/me.js` · `auth/logout.js` — вход через Telegram, сессия в httpOnly-cookie (JWT).
  - `progress.js` · `attempts.js` · `tradetest-result.js` — прогресс пользователя (сервер-авторитетный пересчёт = анти-чит).
  - `_lib/` — db (Neon), auth (JWT/cookie), telegram (проверка подписи виджета), quiz (серверные хелперы), schema.sql.
  - `_data/` — статический контент квиза (ESM).
- `test/` — unit-тесты (Vitest): подпись Telegram, JWT/cookie, quiz-хелперы, сборка стора.

Подробный план реализации: `docs/superpowers/plans/2026-06-15-finance-quiz-telegram.md`.

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
