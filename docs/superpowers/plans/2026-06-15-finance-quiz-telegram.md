# Кванта — Finance Quiz: Production Build + Telegram Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить клиентский React-прототип финансового квиза «Кванта» (JSX-в-браузере через Babel, `window.*`-глобалы, прогресс в `localStorage`) в продакшен-приложение на Vite + React со сборкой, Vercel serverless-функциями (`/api`), хранением в Neon Postgres и авторизацией **только** через Telegram Login Widget.

**Architecture:** Vite SPA отдаёт статику; вся динамика — в serverless-функциях `/api/*`. Контент квиза (вопросы/словарь/трейд-тест) раздаётся одним эндпоинтом `/api/content`. Авторизация: на фронте — Telegram Login Widget, на бэке — проверка HMAC-подписи виджета по токену бота, выпуск JWT в httpOnly-cookie. Прогресс пользователя (попытки, статистика, серии) персистится в Neon Postgres по `telegram_id`. Никакого email/пароля — вход исключительно через Telegram.

**Tech Stack:** Vite 5, React 18, `lightweight-charts` (npm), Vercel Functions (Node 24, ESM), `@neondatabase/serverless` (Neon Postgres), `jose` (JWT), `node:crypto` (проверка подписи Telegram), Vitest (тесты).

---

## Предусловия (выполняет пользователь — НЕ агент)

Эти шаги требуют действий человека вне кодовой базы. Агент не может их выполнить; он останавливается и просит пользователя, когда они нужны (Task 16, Task 21).

1. **Создать бота** в Telegram: написать [@BotFather](https://t.me/BotFather) → `/newbot` → задать имя и username (например `kvanta_quiz_bot`). BotFather выдаст **токен** вида `123456:ABC-DEF...`.
2. **Привязать домен** к боту (нужно для Login Widget): `/setdomain` → выбрать бота → отправить домен Vercel-деплоя (например `kvanta-quiz.vercel.app`, позже — кастомный домен). Без этого виджет не отрисуется.
3. **Подключить Neon** через Vercel Marketplace (Task 16): это автоматически добавит `DATABASE_URL` в окружение проекта.
4. Передать агенту: **токен бота**, **username бота**, **домен** (когда будет известен).

---

## File Structure (целевая)

```
finance-quiz/
  package.json                 — ESM ("type":"module"), скрипты dev/build/test/migrate
  vite.config.js               — плагин React, dev-прокси на /api
  vercel.json                  — SPA-fallback rewrite, framework=vite
  .env.example                 — список переменных окружения
  .gitignore
  index.html                   — Vite-точка входа (без CDN-скриптов!)

  src/
    main.jsx                   — boot: грузит контент + сессию, потом рендерит <App/>
    App.jsx                    — оболочка/роутер/ctx (из прототипа app.jsx, без localStorage-стора)
    styles.css                 — без изменений (копия из прототипа)
    lib/
      api.js                   — fetch-обёртки к /api/*
      content.js               — синглтон контента C + initContent()
      quiz.js                  — QData, isCorrect, arrEq, computeStats, computeStreak, dayKey
      format.js                — rel, money, pct1
    components/
      ui.jsx                   — I (иконки), Logo, Btn, Chip, TopicChip, Pbar, Stat, Ring, Spark, Bars
      charts.jsx               — TVChart, anchorsToCloses, genCandles, volFromCandles (npm lightweight-charts)
      tweaks.jsx               — useTweaks, TweaksPanel, Tweak* (из tweaks-panel.jsx)
      viz/
        finance.jsx            — VIZ_FINANCE (из viz_finance.jsx)
        chart.jsx              — VIZ_CHART (из viz_chart.jsx)
        index.js               — export const VIZ = { ...VIZ_FINANCE, ...VIZ_CHART }
    screens/
      Auth.jsx                 — НОВЫЙ: Telegram Login Widget
      Dashboard.jsx            — Dashboard, StatTile, SectionTitle, BackdropChart, accTrend, volTrend
      Quiz.jsx                 — QuizScreen, Difficulty, ResultScreen, ReviewItem
      LearnStats.jsx           — ModesScreen, ScopeChip, LearnScreen, ProgressScreen, HistoryScreen, Empty
      Extra.jsx                — GlossaryScreen, buildTT, TTChart, TradeTestScreen

  api/
    content.js                 — GET: { topics, questions, modes, glossary, tradetest }
    progress.js                — GET: весь стор пользователя
    attempts.js                — POST: сохранить попытку (сервер-авторитетный пересчёт)
    tradetest-result.js        — POST: сохранить результат трейд-теста
    auth/
      telegram.js              — POST: проверка подписи виджета → JWT cookie → user
      me.js                    — GET: текущий пользователь по cookie (или 401)
      logout.js                — POST: очистка cookie
    _lib/
      db.js                    — neon() клиент
      auth.js                  — signSession, verifySession, requireUser, cookie-хелперы
      telegram.js              — verifyTelegramLogin(data, botToken)
      quiz.js                  — isCorrect, arrEq, computeStreak (серверная копия)
      schema.sql               — DDL
    _data/
      questions.js             — export QUESTIONS, TOPICS, MODES (из data.js, без window/QData)
      glossary.js              — export GLOSSARY
      tradetest.js             — export TRADETEST

  scripts/
    migrate.js                 — применяет api/_lib/schema.sql к Neon

  test/
    telegram.test.js
    auth.test.js
    quiz.test.js
    progress.test.js
```

**Источник прототипа:** `/Users/ivanm3/Downloads/finance quiz (1)/` — далее «PROTO». Все экраны/визуализации/стили копируются ОТТУДА с механическими правками (см. Task 9). Бизнес-логика UI не переписывается.

---

## Глобальная карта замен при миграции (применяется в Task 7–12)

При переезде с `window.*`-глобалов на ESM-модули в КАЖДОМ скопированном файле:

1. Добавить в начало нужные импорты React-хуков:
   `import React, { useState, useEffect, useMemo, useRef } from 'react'`
   (в прототипе они были глобальными; оставить только реально используемые хуки).
2. Заменить обращения к глобалам на импорты по таблице:

| Было (`window.X` / глобал) | Стало (импорт) | Из модуля |
|---|---|---|
| `window.QUESTIONS` | `C.questions` | `src/lib/content.js` |
| `window.TOPICS` | `C.topics` | `src/lib/content.js` |
| `window.MODES` | `C.modes` | `src/lib/content.js` |
| `window.GLOSSARY` | `C.glossary` | `src/lib/content.js` |
| `window.TRADETEST` | `C.tradetest` | `src/lib/content.js` |
| `window.QData` | `QData` | `src/lib/quiz.js` |
| `window.isCorrect` | `isCorrect` | `src/lib/quiz.js` |
| `window.VIZ` | `VIZ` | `src/components/viz/index.js` |
| `I`, `Logo`, `Btn`, `Chip`, `TopicChip`, `Pbar`, `Stat`, `Ring`, `Spark`, `Bars` | именованный импорт | `src/components/ui.jsx` |
| `TVChart`, `anchorsToCloses`, `genCandles`, `volFromCandles` | именованный импорт | `src/components/charts.jsx` |
| `useTweaks`, `TweaksPanel`, `TweakSection`, `TweakColor`, `TweakRadio`, `TweakToggle`, ... | именованный импорт | `src/components/tweaks.jsx` |
| `rel`, `money`, `pct1` | именованный импорт | `src/lib/format.js` |
| `LightweightCharts.createChart` (CDN-глобал) | `createChart` | `import { createChart } from 'lightweight-charts'` |

3. Превратить top-level `function Name(){}` / `const Name=` , которые используются в других файлах, в `export function`/`export const`.
4. Удалить любые `window.X = ...` присваивания.

> Тела функций/компонентов **копируются дословно** из PROTO — менять только импорты/экспорты и обращения к глобалам по таблице.

---

## Phase 0 — Скелет проекта

### Task 1: Инициализация репозитория и package.json

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Создать package.json**

```json
{
  "name": "finance-quiz",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "migrate": "node --env-file=.env scripts/migrate.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "jose": "^5.9.6",
    "lightweight-charts": "^4.1.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Создать .gitignore**

```
node_modules
dist
.env
.env*.local
.vercel
.DS_Store
```

- [ ] **Step 3: Создать .env.example**

```
# Telegram (от @BotFather)
TELEGRAM_BOT_TOKEN=123456:ABC-REPLACE-ME
TELEGRAM_BOT_USERNAME=kvanta_quiz_bot
VITE_TELEGRAM_BOT_USERNAME=kvanta_quiz_bot

# Сессии
JWT_SECRET=replace-with-a-long-random-string

# Neon Postgres (добавляется автоматически интеграцией Vercel)
DATABASE_URL=postgres://...
```

- [ ] **Step 4: Установить зависимости**

Run: `npm install`
Expected: создаётся `node_modules`, `package-lock.json`, без ошибок.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore .env.example package-lock.json
git commit -m "chore: scaffold finance-quiz project (vite + vercel functions)"
```

### Task 2: Конфигурация Vite и Vercel

**Files:**
- Create: `vite.config.js`
- Create: `vercel.json`
- Create: `index.html`

- [ ] **Step 1: Создать vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
})
```

> Прокси на `:3000` нужен только если бэкенд гоняется через `vercel dev`. Для unit-тестов прокси не используется.

- [ ] **Step 2: Создать vercel.json**

```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 3: Создать index.html (Vite-точка входа, БЕЗ CDN-скриптов)**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Кванта · тренажёр по финансам</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Скопировать стили из прототипа**

Run: `cp "/Users/ivanm3/Downloads/finance quiz (1)/styles.css" src/styles.css`
Expected: файл `src/styles.css` создан (потребуется `mkdir -p src` заранее).

- [ ] **Step 5: Commit**

```bash
git add vite.config.js vercel.json index.html src/styles.css
git commit -m "chore: vite + vercel config, html entry, styles"
```

---

## Phase 1 — Контент: данные + эндпоинт

### Task 3: Перенести данные в api/_data как ESM-модули

**Files:**
- Create: `api/_data/questions.js`
- Create: `api/_data/glossary.js`
- Create: `api/_data/tradetest.js`

- [ ] **Step 1: questions.js — скопировать тело массивов из PROTO/data.js**

Скопировать содержимое `PROTO/data.js`, затем механически:
- `window.TOPICS = [...]` → `export const TOPICS = [...]`
- `window.QUESTIONS = [...]` → `export const QUESTIONS = [...]`
- `window.MODES = {...}` → `export const MODES = {...}`
- **Удалить** блок `window.QData = {...}` целиком (хелперы переезжают на клиент в `src/lib/quiz.js` — Task 5).

Файл должен экспортировать ровно три символа: `TOPICS`, `QUESTIONS`, `MODES`. Никаких `window.`.

- [ ] **Step 2: glossary.js**

Скопировать `PROTO/glossary.js`, заменить `window.GLOSSARY = [...]` → `export const GLOSSARY = [...]`.

- [ ] **Step 3: tradetest.js**

Скопировать `PROTO/tradetest.js`, заменить `window.TRADETEST = [...]` → `export const TRADETEST = [...]`.

- [ ] **Step 4: Проверить, что модули валидны**

Run: `node -e "import('./api/_data/questions.js').then(m=>console.log(m.QUESTIONS.length, m.TOPICS.length, Object.keys(m.MODES)))"`
Expected: печатает число вопросов (>0), `4`, и список ключей режимов — без синтаксических ошибок.

- [ ] **Step 5: Commit**

```bash
git add api/_data
git commit -m "feat: quiz content as ESM data modules"
```

### Task 4: Эндпоинт /api/content

**Files:**
- Create: `api/content.js`

- [ ] **Step 1: Написать обработчик**

```js
import { QUESTIONS, TOPICS, MODES } from './_data/questions.js'
import { GLOSSARY } from './_data/glossary.js'
import { TRADETEST } from './_data/tradetest.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({ topics: TOPICS, questions: QUESTIONS, modes: MODES, glossary: GLOSSARY, tradetest: TRADETEST })
}
```

> Правильные ответы (`correct`) включаются в ответ — это учебный проект, и UI квиза показывает мгновенный разбор. Анти-чит-проверка всё равно дублируется на сервере в `/api/attempts` (Task 19), так что прогресс не подделать через подмену фронта.

- [ ] **Step 2: Commit**

```bash
git add api/content.js
git commit -m "feat: GET /api/content serves quiz content"
```

---

## Phase 2 — Клиентский слой данных (TDD)

### Task 5: Контент-синглтон и quiz-хелперы

**Files:**
- Create: `src/lib/content.js`
- Create: `src/lib/quiz.js`
- Test: `test/quiz.test.js`

- [ ] **Step 1: content.js**

```js
// Синглтон контента. Заполняется один раз в main.jsx до рендера App,
// поэтому экраны читают C.* синхронно (как раньше window.*).
export const C = { topics: [], questions: [], modes: {}, glossary: [], tradetest: [] }

export function initContent(data) {
  C.topics = data.topics || []
  C.questions = data.questions || []
  C.modes = data.modes || {}
  C.glossary = data.glossary || []
  C.tradetest = data.tradetest || []
}
```

- [ ] **Step 2: Написать падающий тест quiz.test.js**

```js
import { describe, it, expect } from 'vitest'
import { arrEq, isCorrect, QData, computeStreak, dayKey } from '../src/lib/quiz.js'
import { C } from '../src/lib/content.js'

describe('quiz helpers', () => {
  it('arrEq compares regardless of order', () => {
    expect(arrEq([1, 2], [2, 1])).toBe(true)
    expect(arrEq([1], [1, 2])).toBe(false)
  })

  it('isCorrect matches the correct option set', () => {
    const q = { id: 'q1', correct: [0, 2] }
    expect(isCorrect(q, [2, 0])).toBe(true)
    expect(isCorrect(q, [0])).toBe(false)
    expect(isCorrect(q, undefined)).toBeFalsy()
  })

  it('QData.byTopic / question / shuffle work on injected content', () => {
    C.questions = [
      { id: 'a', topic: 'pf' }, { id: 'b', topic: 'ta' }, { id: 'c', topic: 'pf' },
    ]
    expect(QData.byTopic('pf').map(q => q.id)).toEqual(['a', 'c'])
    expect(QData.question('b').topic).toBe('ta')
    expect(QData.shuffle(['x', 'y', 'z'])).toHaveLength(3)
  })

  it('computeStreak counts consecutive days ending today', () => {
    const today = new Date()
    const d = (n) => { const x = new Date(today); x.setDate(x.getDate() - n); return dayKey(x) }
    const days = { [d(0)]: 3, [d(1)]: 1, [d(2)]: 2 }
    expect(computeStreak(days)).toBe(3)
  })
})
```

- [ ] **Step 3: Запустить тест — должен упасть**

Run: `npm test -- test/quiz.test.js`
Expected: FAIL — `Cannot find module '../src/lib/quiz.js'`.

- [ ] **Step 4: Реализовать quiz.js**

```js
import { C } from './content.js'

export function arrEq(a, b) {
  const x = [...a].sort(), y = [...b].sort()
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function isCorrect(q, ans) {
  return ans && arrEq(ans, q.correct)
}

export const QData = {
  byTopic: (tid) => C.questions.filter((q) => q.topic === tid),
  topic: (id) => C.topics.find((t) => t.id === id),
  question: (id) => C.questions.find((q) => q.id === id),
  shuffle: (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  },
}

export const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export function computeStats(qstats) {
  const out = {}
  C.topics.forEach((t) => {
    const qs = QData.byTopic(t.id)
    let seen = 0, corr = 0
    qs.forEach((q) => { const st = qstats[q.id]; if (st && st.seen > 0) { seen++; if (st.correct > 0) corr++ } })
    out[t.id] = { answered: seen, correct: corr, mastery: qs.length ? Math.round(corr / qs.length * 100) : 0 }
  })
  return out
}

export function computeStreak(days) {
  let n = 0
  const d = new Date()
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1)
  for (let i = 0; i < 400; i++) { if (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1) } else break }
  return n
}
```

> `QData.shuffle` в прототипе мог отличаться реализацией — функционально это Fisher–Yates, поведение идентично. `computeStats`/`computeStreak` перенесены из `PROTO/app.jsx` дословно (с `window.TOPICS`→`C.topics`, `window.QData`→`QData`).

- [ ] **Step 5: Запустить тест — должен пройти**

Run: `npm test -- test/quiz.test.js`
Expected: PASS (4 теста).

- [ ] **Step 6: Commit**

```bash
git add src/lib/content.js src/lib/quiz.js test/quiz.test.js
git commit -m "feat: client content singleton + quiz helpers (tested)"
```

### Task 6: API-обёртки и форматтеры

**Files:**
- Create: `src/lib/api.js`
- Create: `src/lib/format.js`

- [ ] **Step 1: api.js**

```js
const json = (r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
const post = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })

export const api = {
  content: () => fetch('/api/content').then(json),
  me: () => fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
  telegramLogin: (data) => post('/api/auth/telegram', data).then(json),
  logout: () => post('/api/auth/logout'),
  progress: () => fetch('/api/progress').then(json),
  saveAttempt: (attempt) => post('/api/attempts', attempt).then(json),
  saveTradeResult: (score) => post('/api/tradetest-result', { score }).then(json),
}
```

- [ ] **Step 2: format.js — перенести из PROTO/screens_auth_dash.jsx**

```js
export function rel(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'только что'
  const m = Math.floor(s / 60); if (m < 60) return m + ' мин назад'
  const h = Math.floor(m / 60); if (h < 24) return h + ' ч назад'
  const d = Math.floor(h / 24); if (d < 7) return d + ' дн назад'
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
export const pct1 = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
export const money = (v) => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'K' : v.toFixed(0))
```

> Сверить тело `rel` с `PROTO/screens_auth_dash.jsx:171` и скопировать дословно, если отличается. `pct1`/`money` — из `PROTO/viz_finance.jsx:40-41`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.js src/lib/format.js
git commit -m "feat: api client wrappers + format helpers"
```

---

## Phase 3 — Перенос UI на ESM-модули

> Во всех задачах этой фазы применяется «Глобальная карта замен» выше. Тела копируются дословно из PROTO.

### Task 7: UI-кит (иконки + примитивы)

**Files:**
- Create: `src/components/ui.jsx`

- [ ] **Step 1: Скопировать PROTO/components.jsx → src/components/ui.jsx**

Run: `cp "/Users/ivanm3/Downloads/finance quiz (1)/components.jsx" src/components/ui.jsx`

- [ ] **Step 2: Применить правки**

- В начало файла добавить: `import React, { useState, useRef, useEffect } from 'react'` (оставить только реально используемые хуки — проверить grep по файлу).
- Перед каждым из используемых снаружи символов поставить `export`: `Ico`, `I`, `Logo`, `Chip`, `TopicChip`, `Pbar`, `Btn`, `Stat`, `Ring`, `Spark`, `Bars`. (`Ico` — внутренний, но пусть тоже экспортируется на всякий.)
- Если внутри есть обращения к `TopicChip`→`window.TOPICS` или подобному — заменить по таблице (`import { C } from '../lib/content.js'`). Проверить grep: `grep -nE "window\.|TVChart|QData" src/components/ui.jsx`.

- [ ] **Step 3: Проверить сборку модуля**

Run: `npx vite build 2>&1 | tail -5` — на этом этапе сборка ещё не пройдёт целиком (нет main.jsx), но синтаксических ошибок в ui.jsx быть не должно. Альтернатива: `node --check`-аналог не работает для JSX; ориентир — отсутствие ошибок парсинга в выводе Vite по этому файлу.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui.jsx
git commit -m "refactor: ui kit as ESM module"
```

### Task 8: Графики (charts) на npm lightweight-charts

**Files:**
- Create: `src/components/charts.jsx`

- [ ] **Step 1: Скопировать PROTO/charts.jsx**

Run: `cp "/Users/ivanm3/Downloads/finance quiz (1)/charts.jsx" src/components/charts.jsx`

- [ ] **Step 2: Применить правки**

- В начало: `import React, { useRef, useEffect } from 'react'` и `import { createChart } from 'lightweight-charts'`.
- Заменить все `LightweightCharts.createChart(` → `createChart(`. Проверить другие обращения к глобалу: `grep -n "LightweightCharts" src/components/charts.jsx` — заменить любые `LightweightCharts.X` на именованный импорт `X` из `'lightweight-charts'` (например `LightweightCharts.CrosshairMode` → импортировать `CrosshairMode`).
- `export` для: `anchorsToCloses`, `genCandles`, `volFromCandles`, `TVChart` (и `seededRand`, если используется снаружи — иначе оставить локальным).

- [ ] **Step 3: Commit**

```bash
git add src/components/charts.jsx
git commit -m "refactor: charts module on npm lightweight-charts"
```

### Task 9: Tweaks-панель

**Files:**
- Create: `src/components/tweaks.jsx`

- [ ] **Step 1: Скопировать PROTO/tweaks-panel.jsx → src/components/tweaks.jsx**

Run: `cp "/Users/ivanm3/Downloads/finance quiz (1)/tweaks-panel.jsx" src/components/tweaks.jsx`

- [ ] **Step 2: Применить правки**

- В начало: `import React, { useState, useEffect, useRef } from 'react'`.
- `useTweaks` использует `localStorage` для UI-предпочтений — **оставить как есть** (это локальные настройки темы, их персистить на сервере не нужно).
- `export` для: `useTweaks`, `TweaksPanel`, `TweakSection`, `TweakRow`, `TweakSlider`, `TweakToggle`, `TweakRadio`, `TweakSelect`, `TweakText`, `TweakNumber`, `TweakColor`, `TweakButton`.
- Проверить: `grep -nE "window\." src/components/tweaks.jsx` — заменить по таблице, если есть.

- [ ] **Step 3: Commit**

```bash
git add src/components/tweaks.jsx
git commit -m "refactor: tweaks panel as ESM module"
```

### Task 10: Визуализации (VIZ)

**Files:**
- Create: `src/components/viz/finance.jsx`
- Create: `src/components/viz/chart.jsx`
- Create: `src/components/viz/index.js`

- [ ] **Step 1: Скопировать оба файла визуализаций**

Run:
```bash
cp "/Users/ivanm3/Downloads/finance quiz (1)/viz_finance.jsx" src/components/viz/finance.jsx
cp "/Users/ivanm3/Downloads/finance quiz (1)/viz_chart.jsx" src/components/viz/chart.jsx
```

- [ ] **Step 2: Правки в finance.jsx**

- В начало: `import React, { useState, useMemo } from 'react'` (по факту использования).
- Импорты компонентов: `import { TVChart, anchorsToCloses, genCandles } from '../charts.jsx'` и `import { I, Btn } from '../ui.jsx'` (точный набор — по grep используемых символов).
- Локальные `pct1`/`money` есть прямо в файле — **оставить** (они объявлены тут) ИЛИ заменить на импорт из `../../lib/format.js`. Чтобы не плодить дубликаты: удалить локальные `const pct1`/`const money` и добавить `import { pct1, money } from '../../lib/format.js'`.
- Заменить `window.VIZ = {...}` (в конце файла) на `export const VIZ_FINANCE = {...}` (тот же объект-карта).

- [ ] **Step 3: Правки в chart.jsx**

- В начало: `import React, { useState, useMemo } from 'react'`.
- Импорты: `import { TVChart, anchorsToCloses, genCandles, volFromCandles } from '../charts.jsx'`, `import { I, Btn } from '../ui.jsx'` (по grep).
- Заменить `window.VIZ = {...}` → `export const VIZ_CHART = {...}`.

> Важно: в прототипе **оба** файла писали в один `window.VIZ` (последний перезатирал? нет — присваивали разные ключи через `Object.assign` или `window.VIZ = {...window.VIZ, ...}`). Проверить: `grep -n "window.VIZ" PROTO/viz_*.jsx`. Если был `window.VIZ = { ...window.VIZ, newKeys }`, то просто экспортировать локальную карту ключей этого файла как `VIZ_FINANCE`/`VIZ_CHART`. Объединение — в index.js ниже.

- [ ] **Step 4: Создать viz/index.js (баррель)**

```js
import { VIZ_FINANCE } from './finance.jsx'
import { VIZ_CHART } from './chart.jsx'

export const VIZ = { ...VIZ_FINANCE, ...VIZ_CHART }
```

- [ ] **Step 5: Commit**

```bash
git add src/components/viz
git commit -m "refactor: visualizations as ESM modules with merged VIZ map"
```

### Task 11: Экраны (кроме авторизации)

**Files:**
- Create: `src/screens/Dashboard.jsx`
- Create: `src/screens/Quiz.jsx`
- Create: `src/screens/LearnStats.jsx`
- Create: `src/screens/Extra.jsx`

- [ ] **Step 1: Скопировать 4 экрана из PROTO**

Run:
```bash
cp "/Users/ivanm3/Downloads/finance quiz (1)/screens_auth_dash.jsx" src/screens/Dashboard.jsx
cp "/Users/ivanm3/Downloads/finance quiz (1)/screens_quiz.jsx" src/screens/Quiz.jsx
cp "/Users/ivanm3/Downloads/finance quiz (1)/screens_learn_stats.jsx" src/screens/LearnStats.jsx
cp "/Users/ivanm3/Downloads/finance quiz (1)/screens_extra.jsx" src/screens/Extra.jsx
```

- [ ] **Step 2: Dashboard.jsx — правки**

- **Удалить** функцию `AuthScreen` целиком (вход теперь отдельный экран `src/screens/Auth.jsx`, Task 14).
- В начало: `import React, { useState, useMemo } from 'react'`.
- Импорты по grep: `import { I, Logo, Btn, Chip, TopicChip, Pbar, Stat, Ring, Spark, Bars } from '../components/ui.jsx'`, `import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'`, `import { C } from '../lib/content.js'`, `import { QData } from '../lib/quiz.js'`, `import { rel } from '../lib/format.js'`.
- Заменить `window.TOPICS`→`C.topics`, `window.QUESTIONS`→`C.questions` и т.д. по таблице.
- `export` для: `Dashboard`, `StatTile`, `SectionTitle`, `BackdropChart`, `rel` (НЕ экспортировать — теперь импортируется из format.js; удалить локальное определение `rel` и использовать импорт), `accTrend`, `volTrend`. Экспортировать минимум `Dashboard` (остальное — по необходимости использования в App/других экранах).

- [ ] **Step 3: Quiz.jsx — правки**

- **Удалить** локальные `arrEq` и `isCorrect` (переехали в `src/lib/quiz.js`).
- В начало: `import React, { useState, useMemo } from 'react'`.
- Импорты: `import { I, Btn, TopicChip, Pbar, Ring } from '../components/ui.jsx'`, `import { VIZ } from '../components/viz/index.js'`, `import { C } from '../lib/content.js'`, `import { QData, isCorrect } from '../lib/quiz.js'`.
- Заменить `window.isCorrect`→`isCorrect`, `window.VIZ`→`VIZ`, `window.QData`→`QData`, `window.TOPICS`→`C.topics`.
- `export function QuizScreen`, `export function ResultScreen` (Difficulty, ReviewItem — export по необходимости).

- [ ] **Step 4: LearnStats.jsx — правки**

- В начало: `import React, { useState, useMemo } from 'react'`.
- Импорты: `import { I, Btn, Chip, TopicChip, Pbar, Stat, Ring, Spark, Bars } from '../components/ui.jsx'`, `import { C } from '../lib/content.js'`, `import { QData } from '../lib/quiz.js'`, `import { rel } from '../lib/format.js'`.
- Заменить глобалы по таблице.
- `export` для: `ModesScreen`, `LearnScreen`, `ProgressScreen`, `HistoryScreen`.

- [ ] **Step 5: Extra.jsx — правки**

- В начало: `import React, { useState, useMemo } from 'react'`.
- Импорты: `import { I, Btn, Chip } from '../components/ui.jsx'`, `import { TVChart, anchorsToCloses, genCandles, volFromCandles } from '../components/charts.jsx'`, `import { C } from '../lib/content.js'`.
- Заменить `window.GLOSSARY`→`C.glossary`, `window.TRADETEST`→`C.tradetest`, `window.TOPICS`→`C.topics`.
- `export` для: `GlossaryScreen`, `TradeTestScreen`.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Dashboard.jsx src/screens/Quiz.jsx src/screens/LearnStats.jsx src/screens/Extra.jsx
git commit -m "refactor: quiz screens as ESM modules"
```

---

## Phase 4 — Авторизация Telegram (TDD)

### Task 12: Проверка подписи Telegram Login Widget

**Files:**
- Create: `api/_lib/telegram.js`
- Test: `test/telegram.test.js`

- [ ] **Step 1: Написать падающий тест**

```js
import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { verifyTelegramLogin } from '../api/_lib/telegram.js'

const TOKEN = '123456:TESTTOKEN'

// Собираем валидно подписанные данные тем же алгоритмом, что Telegram.
function sign(fields, token) {
  const checkString = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n')
  const secret = crypto.createHash('sha256').update(token).digest()
  return crypto.createHmac('sha256', secret).update(checkString).digest('hex')
}

describe('verifyTelegramLogin', () => {
  const base = { id: 777, first_name: 'Иван', username: 'ivan', auth_date: Math.floor(Date.now() / 1000) }

  it('accepts a correctly signed payload', () => {
    const data = { ...base, hash: sign(base, TOKEN) }
    const out = verifyTelegramLogin(data, TOKEN)
    expect(out).toBeTruthy()
    expect(Number(out.id)).toBe(777)
  })

  it('rejects a tampered payload', () => {
    const data = { ...base, hash: sign(base, TOKEN) }
    data.first_name = 'Мэллори'
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })

  it('rejects a wrong-token signature', () => {
    const data = { ...base, hash: sign(base, 'other:TOKEN') }
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })

  it('rejects a stale auth_date (older than 24h)', () => {
    const old = { ...base, auth_date: Math.floor(Date.now() / 1000) - 90000 }
    const data = { ...old, hash: sign(old, TOKEN) }
    expect(verifyTelegramLogin(data, TOKEN)).toBeNull()
  })
})
```

- [ ] **Step 2: Запустить — должен упасть**

Run: `npm test -- test/telegram.test.js`
Expected: FAIL — модуль `api/_lib/telegram.js` не найден.

- [ ] **Step 3: Реализовать telegram.js**

```js
import crypto from 'node:crypto'

const MAX_AGE_SEC = 86400 // 24 часа

// Возвращает проверенные поля (без hash) или null, если подпись/срок невалидны.
export function verifyTelegramLogin(data, botToken) {
  if (!data || typeof data.hash !== 'string') return null
  const { hash, ...fields } = data

  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n')

  const secret = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex')

  // constant-time сравнение
  const a = Buffer.from(hmac, 'hex')
  const b = Buffer.from(hash, 'hex')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  const authDate = Number(fields.auth_date)
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SEC) return null

  return fields
}
```

- [ ] **Step 4: Запустить — должен пройти**

Run: `npm test -- test/telegram.test.js`
Expected: PASS (4 теста).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/telegram.js test/telegram.test.js
git commit -m "feat: telegram login widget signature verification (tested)"
```

### Task 13: JWT-сессии и cookie-хелперы

**Files:**
- Create: `api/_lib/auth.js`
- Test: `test/auth.test.js`

- [ ] **Step 1: Написать падающий тест**

```js
import { describe, it, expect, beforeAll } from 'vitest'
import { signSession, verifySession, serializeCookie, parseCookies } from '../api/_lib/auth.js'

beforeAll(() => { process.env.JWT_SECRET = 'test-secret-test-secret-test-secret' })

describe('session jwt', () => {
  it('signs and verifies a round-trip payload', async () => {
    const token = await signSession({ id: 42, telegram_id: 777, first_name: 'Иван' })
    const payload = await verifySession(token)
    expect(payload.id).toBe(42)
    expect(payload.telegram_id).toBe(777)
  })

  it('returns null for a garbage token', async () => {
    expect(await verifySession('not-a-jwt')).toBeNull()
  })
})

describe('cookies', () => {
  it('serializes httpOnly cookie', () => {
    const c = serializeCookie('fq_session', 'abc', { maxAge: 100 })
    expect(c).toContain('fq_session=abc')
    expect(c).toContain('HttpOnly')
    expect(c).toContain('Max-Age=100')
  })

  it('parses a cookie header', () => {
    expect(parseCookies('a=1; fq_session=xyz')).toMatchObject({ a: '1', fq_session: 'xyz' })
  })
})
```

- [ ] **Step 2: Запустить — упадёт**

Run: `npm test -- test/auth.test.js`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать auth.js**

```js
import { SignJWT, jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET)
export const SESSION_COOKIE = 'fq_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 дней

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifySession(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload
  } catch {
    return null
  }
}

export function serializeCookie(name, value, { maxAge = MAX_AGE } = {}) {
  return [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`,
  ].join('; ')
}

export function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map((c) => c.trim()).filter(Boolean).map((c) => {
      const i = c.indexOf('=')
      return [c.slice(0, i), c.slice(i + 1)]
    })
  )
}

// Достаёт пользователя из cookie запроса. null, если нет валидной сессии.
export async function requireUser(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  return verifySession(cookies[SESSION_COOKIE])
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, token))
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { maxAge: 0 }))
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `npm test -- test/auth.test.js`
Expected: PASS (4 теста).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/auth.js test/auth.test.js
git commit -m "feat: jwt session + cookie helpers (tested)"
```

### Task 14: Экран входа с Telegram Login Widget

**Files:**
- Create: `src/screens/Auth.jsx`

- [ ] **Step 1: Реализовать Auth.jsx**

```jsx
import React, { useEffect, useRef } from 'react'
import { Logo } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'

const BOT = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

// Telegram вызывает window.onTelegramAuth(user) после успешного входа в виджете.
export default function Auth({ onLogin }) {
  const slot = useRef(null)

  useEffect(() => {
    window.onTelegramAuth = (user) => onLogin(user)
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-widget.js?22'
    s.async = true
    s.setAttribute('data-telegram-login', BOT)
    s.setAttribute('data-size', 'large')
    s.setAttribute('data-radius', '12')
    s.setAttribute('data-request-access', 'write')
    s.setAttribute('data-onauth', 'onTelegramAuth(user)')
    slot.current?.appendChild(s)
    return () => { delete window.onTelegramAuth }
  }, [onLogin])

  const candles = genCandles(anchorsToCloses([[0, 80], [0.4, 110], [0.6, 96], [1, 130]], 50, 1.4, 3), { seed: 9 })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 50% -10%, rgba(41,98,255,.14), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '45%', opacity: 0.3, pointerEvents: 'none' }}>
        <TVChart candles={candles} height={360} autosize />
      </div>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 410, padding: 30, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
          <Logo size={34} />
          <div>
            <div className="brand-name" style={{ fontSize: 16 }}>Кванта</div>
            <div className="brand-sub">тренажёр по финансам</div>
          </div>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, letterSpacing: '-.02em' }}>Вход через Telegram</h2>
        <p style={{ fontSize: 13, color: 'var(--tx-3)', marginTop: 0, lineHeight: 1.5 }}>
          Авторизация и сохранение прогресса — только через Telegram. Нажмите кнопку ниже.
        </p>
        <div ref={slot} style={{ marginTop: 22, minHeight: 48, display: 'flex', justifyContent: 'center' }} />
        <p style={{ fontSize: 11, color: 'var(--tx-3)', textAlign: 'center', marginTop: 18, marginBottom: 0, lineHeight: 1.5 }}>
          Мы получаем только ваш Telegram-профиль (имя и фото). Пароль не требуется.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/Auth.jsx
git commit -m "feat: telegram login widget auth screen"
```

### Task 15: Эндпоинты auth (telegram / me / logout)

**Files:**
- Create: `api/auth/telegram.js`
- Create: `api/auth/me.js`
- Create: `api/auth/logout.js`
- Create: `api/_lib/db.js`

- [ ] **Step 1: db.js**

```js
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL)
```

- [ ] **Step 2: api/auth/telegram.js**

```js
import { sql } from '../_lib/db.js'
import { verifyTelegramLogin } from '../_lib/telegram.js'
import { signSession, setSessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const fields = verifyTelegramLogin(req.body, process.env.TELEGRAM_BOT_TOKEN)
  if (!fields) return res.status(401).json({ error: 'invalid telegram signature' })

  const tgId = Number(fields.id)
  const rows = await sql`
    insert into users (telegram_id, username, first_name, last_name, photo_url)
    values (${tgId}, ${fields.username || null}, ${fields.first_name || null}, ${fields.last_name || null}, ${fields.photo_url || null})
    on conflict (telegram_id) do update
      set username = excluded.username,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          photo_url = excluded.photo_url
    returning id, telegram_id, username, first_name, last_name, photo_url`
  const user = rows[0]
  await sql`insert into user_meta (user_id, best_streak) values (${user.id}, 0) on conflict do nothing`

  const token = await signSession({
    id: Number(user.id), telegram_id: Number(user.telegram_id),
    name: user.first_name || user.username, photo_url: user.photo_url,
  })
  setSessionCookie(res, token)
  res.json({ user: { id: Number(user.id), name: user.first_name || user.username, username: user.username, photo_url: user.photo_url } })
}
```

- [ ] **Step 3: api/auth/me.js**

```js
import { requireUser } from '../_lib/auth.js'

export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  res.json({ user: { id: u.id, name: u.name, photo_url: u.photo_url } })
}
```

- [ ] **Step 4: api/auth/logout.js**

```js
import { clearSessionCookie } from '../_lib/auth.js'

export default function handler(req, res) {
  clearSessionCookie(res)
  res.json({ ok: true })
}
```

- [ ] **Step 5: Commit**

```bash
git add api/auth api/_lib/db.js
git commit -m "feat: telegram auth endpoints (login/me/logout)"
```

---

## Phase 5 — База данных и прогресс

### Task 16: Подключить Neon + схема БД

**Files:**
- Create: `api/_lib/schema.sql`
- Create: `scripts/migrate.js`

- [ ] **Step 1: ОСТАНОВКА — действие пользователя**

Попросить пользователя подключить Neon: Vercel Dashboard → проект → **Storage / Marketplace → Neon → Connect**. Это добавит `DATABASE_URL` в окружение проекта. Затем `vercel env pull .env` (или вручную скопировать `DATABASE_URL` в локальный `.env`). Альтернатива для локали — создать бесплатную БД на neon.tech и вставить строку подключения в `.env`.

- [ ] **Step 2: schema.sql**

```sql
create table if not exists users (
  id          bigserial primary key,
  telegram_id bigint unique not null,
  username    text,
  first_name  text,
  last_name   text,
  photo_url   text,
  created_at  timestamptz not null default now()
);

create table if not exists attempts (
  id         text primary key,
  user_id    bigint not null references users(id) on delete cascade,
  mode       text not null,
  topic      text,
  score      int  not null,
  total      int  not null,
  qids       jsonb not null,
  answers    jsonb not null,
  spark      jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_idx on attempts(user_id, created_at desc);

create table if not exists qstats (
  user_id     bigint not null references users(id) on delete cascade,
  question_id text not null,
  seen        int not null default 0,
  correct     int not null default 0,
  primary key (user_id, question_id)
);

create table if not exists wrong (
  user_id     bigint not null references users(id) on delete cascade,
  question_id text not null,
  primary key (user_id, question_id)
);

create table if not exists days (
  user_id  bigint not null references users(id) on delete cascade,
  day      date not null,
  answered int not null default 0,
  primary key (user_id, day)
);

create table if not exists user_meta (
  user_id     bigint primary key references users(id) on delete cascade,
  best_streak int not null default 0,
  tt_best     int
);
```

- [ ] **Step 3: scripts/migrate.js**

```js
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const ddl = readFileSync(new URL('../api/_lib/schema.sql', import.meta.url), 'utf8')

const statements = ddl.split(';').map((s) => s.trim()).filter(Boolean)
for (const stmt of statements) {
  // neon() http-функция выполняет произвольный SQL при вызове со строкой
  // (в @neondatabase/serverless 0.10 у неё нет метода .query()).
  await sql(stmt)
}
console.log(`migrated: ${statements.length} statements`)
```

- [ ] **Step 4: Применить миграцию**

Run: `npm run migrate`
Expected: `migrated: 8 statements` (или близкое число), без ошибок. Если `DATABASE_URL` не задан — сначала Step 1.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/schema.sql scripts/migrate.js
git commit -m "feat: neon postgres schema + migrate script"
```

### Task 17: Серверные quiz-хелперы (для пересчёта прогресса)

**Files:**
- Create: `api/_lib/quiz.js`

- [ ] **Step 1: Реализовать api/_lib/quiz.js**

```js
// Серверная копия проверки ответов и подсчёта серии.
// Дублирует src/lib/quiz.js намеренно: разные корни (src vs api) деплоятся отдельно.

export function arrEq(a, b) {
  const x = [...a].sort(), y = [...b].sort()
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function isCorrect(q, ans) {
  return Array.isArray(ans) && arrEq(ans, q.correct)
}

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

// days: массив строк 'YYYY-MM-DD'. Возвращает длину серии до сегодня.
export function computeStreak(daySet) {
  const set = new Set(daySet)
  let n = 0
  const d = new Date()
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1)
  for (let i = 0; i < 400; i++) {
    if (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/quiz.js
git commit -m "feat: server-side quiz helpers for progress recompute"
```

### Task 18: GET /api/progress (TDD на пересчёте)

**Files:**
- Create: `api/progress.js`
- Test: `test/progress.test.js` (тест на чистую функцию-сборщик стора)

- [ ] **Step 1: Падающий тест на сборку стора**

```js
import { describe, it, expect } from 'vitest'
import { buildStore } from '../api/progress.js'

describe('buildStore', () => {
  it('reshapes db rows into the client store shape', () => {
    const store = buildStore({
      user: { id: 1, name: 'Иван', photo_url: null },
      attempts: [{ id: 'a1', mode: 'topic', topic: 'pf', score: 3, total: 5, qids: ['x'], answers: {}, spark: [100], created_at: '2026-06-10T00:00:00Z' }],
      qstatsRows: [{ question_id: 'x', seen: 2, correct: 1 }],
      wrongRows: [{ question_id: 'y' }],
      dayRows: [{ day: '2026-06-10', answered: 5 }],
      meta: { best_streak: 4, tt_best: 7 },
    })
    expect(store.user.name).toBe('Иван')
    expect(store.attempts[0].id).toBe('a1')
    expect(store.attempts[0].date).toBe(Date.parse('2026-06-10T00:00:00Z'))
    expect(store.qstats.x).toEqual({ seen: 2, correct: 1 })
    expect(store.wrong).toEqual(['y'])
    expect(store.days['2026-06-10']).toBe(5)
    expect(store.ttBest).toBe(7)
    expect(store.bestStreak).toBeGreaterThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Запустить — упадёт**

Run: `npm test -- test/progress.test.js`
Expected: FAIL — `buildStore` не экспортирован.

- [ ] **Step 3: Реализовать api/progress.js**

```js
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'

// Чистая функция — превращает строки БД в форму стора клиента. Тестируется отдельно.
export function buildStore({ user, attempts, qstatsRows, wrongRows, dayRows, meta }) {
  const qstats = {}
  for (const r of qstatsRows) qstats[r.question_id] = { seen: r.seen, correct: r.correct }
  const days = {}
  for (const r of dayRows) days[String(r.day).slice(0, 10)] = r.answered
  const bestStreak = Math.max(meta?.best_streak || 0, computeStreak(Object.keys(days)))
  return {
    user,
    attempts: attempts.map((a) => ({
      id: a.id, mode: a.mode, topic: a.topic, score: a.score, total: a.total,
      qids: a.qids, answers: a.answers, spark: a.spark, date: Date.parse(a.created_at),
    })),
    qstats,
    wrong: wrongRows.map((r) => r.question_id),
    days,
    bestStreak,
    ttBest: meta?.tt_best ?? null,
  }
}

export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  const uid = u.id

  const [attempts, qstatsRows, wrongRows, dayRows, metaRows] = await Promise.all([
    sql`select id, mode, topic, score, total, qids, answers, spark, created_at from attempts where user_id = ${uid} order by created_at desc limit 60`,
    sql`select question_id, seen, correct from qstats where user_id = ${uid}`,
    sql`select question_id from wrong where user_id = ${uid}`,
    sql`select day, answered from days where user_id = ${uid}`,
    sql`select best_streak, tt_best from user_meta where user_id = ${uid}`,
  ])

  res.json(buildStore({
    user: { id: u.id, name: u.name, photo_url: u.photo_url },
    attempts, qstatsRows, wrongRows, dayRows, meta: metaRows[0] || {},
  }))
}
```

- [ ] **Step 4: Запустить — пройдёт**

Run: `npm test -- test/progress.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/progress.js test/progress.test.js
git commit -m "feat: GET /api/progress with tested store reshaping"
```

### Task 19: POST /api/attempts (сервер-авторитетный)

**Files:**
- Create: `api/attempts.js`

- [ ] **Step 1: Реализовать api/attempts.js**

```js
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { isCorrect, computeStreak } from './_lib/quiz.js'
import { QUESTIONS } from './_data/questions.js'

const byId = new Map(QUESTIONS.map((q) => [q.id, q]))
const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const { mode, topic = null, qids, answers, date } = req.body || {}
  if (!Array.isArray(qids) || typeof answers !== 'object' || !answers) {
    return res.status(400).json({ error: 'bad request' })
  }
  const uid = u.id
  const when = date || Date.now()

  let score = 0
  const spark = []
  for (const id of qids) {
    const q = byId.get(id)
    if (!q) { spark.push(20); continue }
    const ok = isCorrect(q, answers[id])
    spark.push(ok ? 100 : 20)
    if (ok) score++
    await sql`
      insert into qstats (user_id, question_id, seen, correct)
      values (${uid}, ${id}, 1, ${ok ? 1 : 0})
      on conflict (user_id, question_id) do update
        set seen = qstats.seen + 1, correct = qstats.correct + ${ok ? 1 : 0}`
    if (ok) {
      await sql`delete from wrong where user_id = ${uid} and question_id = ${id}`
    } else {
      await sql`insert into wrong (user_id, question_id) values (${uid}, ${id}) on conflict do nothing`
    }
  }

  const attemptId = 'a' + when
  await sql`
    insert into attempts (id, user_id, mode, topic, score, total, qids, answers, spark)
    values (${attemptId}, ${uid}, ${mode}, ${topic}, ${score}, ${qids.length},
            ${JSON.stringify(qids)}::jsonb, ${JSON.stringify(answers)}::jsonb, ${JSON.stringify(spark)}::jsonb)
    on conflict (id) do nothing`

  const day = dayKey(when)
  await sql`
    insert into days (user_id, day, answered) values (${uid}, ${day}, ${qids.length})
    on conflict (user_id, day) do update set answered = days.answered + ${qids.length}`

  const dayRows = await sql`select day from days where user_id = ${uid}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))
  await sql`
    insert into user_meta (user_id, best_streak) values (${uid}, ${streak})
    on conflict (user_id) do update set best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ attempt: { id: attemptId, mode, topic, score, total: qids.length, date: when, qids, answers, spark } })
}
```

- [ ] **Step 2: Commit**

```bash
git add api/attempts.js
git commit -m "feat: POST /api/attempts with server-authoritative scoring"
```

### Task 20: POST /api/tradetest-result

**Files:**
- Create: `api/tradetest-result.js`

- [ ] **Step 1: Реализовать api/tradetest-result.js**

```js
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'
import { TRADETEST } from './_data/tradetest.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const score = Number(req.body?.score)
  if (!Number.isFinite(score)) return res.status(400).json({ error: 'bad request' })
  const uid = u.id
  const day = dayKey(Date.now())

  await sql`
    insert into days (user_id, day, answered) values (${uid}, ${day}, ${TRADETEST.length})
    on conflict (user_id, day) do update set answered = days.answered + ${TRADETEST.length}`

  const dayRows = await sql`select day from days where user_id = ${uid}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))

  await sql`
    insert into user_meta (user_id, best_streak, tt_best) values (${uid}, ${streak}, ${score})
    on conflict (user_id) do update
      set tt_best = greatest(coalesce(user_meta.tt_best, 0), ${score}),
          best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ ttBest: score, ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add api/tradetest-result.js
git commit -m "feat: POST /api/tradetest-result"
```

---

## Phase 6 — Сборка приложения и интеграция

### Task 21: App.jsx и main.jsx — boot, роутер, ctx без localStorage

**Files:**
- Create: `src/App.jsx`
- Create: `src/main.jsx`

- [ ] **Step 1: main.jsx — boot-последовательность**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { api } from './lib/api.js'
import { initContent } from './lib/content.js'
import './styles.css'

async function boot() {
  // Контент нужен синхронно экранам — грузим до первого рендера.
  const content = await api.content()
  initContent(content)
  const me = await api.me() // { user } или null
  const progress = me ? await api.progress() : null
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App initialUser={me?.user || null} initialStore={progress} />
  )
}

boot()
```

- [ ] **Step 2: App.jsx — взять PROTO/app.jsx и переписать стор**

Скопировать `PROTO/app.jsx` в `src/App.jsx`, затем применить правки ниже. Структура `ACCENTS`, `FONTS`, `computeStats`/`computeStreak` (удалить локальные — импортировать из `lib/quiz.js`), весь JSX оболочки (sidebar/tabbar/PhoneFrame/DeviceToggle/tweakPanel) — **копируются дословно**, кроме помеченных мест.

**Импорты в начало файла:**
```js
import React, { useState as uS, useEffect as uE, useMemo } from 'react'
import { api } from './lib/api.js'
import { C } from './lib/content.js'
import { QData, computeStats, computeStreak, dayKey } from './lib/quiz.js'
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from './components/tweaks.jsx'
import { I, Logo, Btn } from './components/ui.jsx'
import Auth from './screens/Auth.jsx'
import { Dashboard } from './screens/Dashboard.jsx'
import { ModesScreen, LearnScreen, ProgressScreen, HistoryScreen } from './screens/LearnStats.jsx'
import { GlossaryScreen, TradeTestScreen } from './screens/Extra.jsx'
import { QuizScreen, ResultScreen } from './screens/Quiz.jsx'
```

**Замены логики стора (вместо localStorage):**

- Удалить `KEY`, `loadStore`, `saveStore`, и локальные `computeStats`/`computeStreak`/`dayKey` (импортируются).
- Сигнатуру `function App()` → `function App({ initialUser, initialStore })`.
- Инициализация состояния:
```js
const EMPTY = { user: null, attempts: [], qstats: {}, wrong: [], days: {}, bestStreak: 0, ttBest: null }
const [store, setStore] = uS(initialStore || EMPTY)
const [screen, setScreen] = uS(initialUser ? 'dashboard' : 'auth')
```
- Удалить `persist` через saveStore. Новый `persist` — только локальное состояние (оптимистично), запись на сервер делают экшены через `api.*`:
```js
const persist = (mut) => setStore((s) => ({ ...s, ...mut(s) }))
```
- В `ctx` заменить экшены:

```js
// вход: вызывается из Auth-экрана с данными виджета Telegram
login: async (tgUser) => {
  const { user } = await api.telegramLogin(tgUser)
  const progress = await api.progress()
  setStore(progress)
  setScreen('dashboard')
},
logout: async () => {
  await api.logout()
  setStore(EMPTY)
  setScreen('auth')
},
```

- В `finishQuiz` — оставить локальный пересчёт (для мгновенного результата), но вместо `saveStore` отправить попытку на сервер:
```js
finishQuiz: (qz, answers) => {
  // ... существующий локальный пересчёт score/perTopic/wrongQ/qstats/days (копируется из PROTO) ...
  persist((s) => ({ attempts: [attempt, ...s.attempts].slice(0, 60), qstats, wrong: [...wrong], days, bestStreak: Math.max(s.bestStreak, computeStreak(days)) }))
  api.saveAttempt({ mode: qz.mode, topic: qz.topic, qids: attempt.qids, answers, date: attempt.date }).catch(() => {})
  setLastResult({ quiz: qz, answers, score, total: qz.questions.length, perTopic, wrong: wrongQ }); nav('result')
},
```

- В `recordTradeResult` — добавить серверный вызов:
```js
recordTradeResult: (sc) => {
  const days = { ...store.days }; const k = dayKey(Date.now()); days[k] = (days[k] || 0) + C.tradetest.length
  persist((s) => ({ days, ttBest: Math.max(s.ttBest || 0, sc), bestStreak: Math.max(s.bestStreak, computeStreak(days)) }))
  api.saveTradeResult(sc).catch(() => {})
},
```

- Заменить все `window.TOPICS`→`C.topics`, `window.QUESTIONS`→`C.questions`, `window.MODES`→`C.modes`, `window.QData`→`QData`, `window.TRADETEST`→`C.tradetest`, `window.isCorrect`→`isCorrect` (импортировать `isCorrect` из `lib/quiz.js`) по всему файлу.
- В `renderScreen`: `case 'auth': return <Auth onLogin={ctx.login} />` (вместо `<AuthScreen ctx={ctx} />`).
- Блок раннего возврата для `screen === 'auth'` — оставить, но рендерить `<Auth onLogin={ctx.login} />`.

- [ ] **Step 3: Прогнать все unit-тесты**

Run: `npm test`
Expected: PASS — все наборы (quiz, telegram, auth, progress).

- [ ] **Step 4: Собрать проект**

Run: `npm run build`
Expected: `vite build` завершается успешно, появляется `dist/`. Любые ошибки «X is not exported» / «is not defined» — это пропущенная замена глобала из таблицы; исправить в соответствующем файле и пересобрать.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: app shell + boot wired to api, telegram-only auth"
```

### Task 22: Локальная проверка через vercel dev

**Files:** (нет новых)

- [ ] **Step 1: Установить Vercel CLI (если нужно) и связать проект**

Run: `npm i -g vercel@latest && vercel link`
Expected: проект слинкован (создаётся `.vercel/`). Требует логина пользователя в Vercel (`vercel login`).

- [ ] **Step 2: Подтянуть переменные окружения**

Run: `vercel env pull .env`
Expected: `.env` содержит `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, `TELEGRAM_BOT_USERNAME`, `VITE_TELEGRAM_BOT_USERNAME`. Если каких-то нет — добавить через `vercel env add` (Task 23) и повторить pull.

- [ ] **Step 3: Запустить локально**

Run: `vercel dev`
Expected: поднимается на `http://localhost:3000`, фронт + `/api/*` в одном процессе.

- [ ] **Step 4: Проверить контент-эндпоинт**

Run: `curl -s http://localhost:3000/api/content | head -c 200`
Expected: JSON с ключами `topics`/`questions`/`modes`/`glossary`/`tradetest`.

- [ ] **Step 5: Проверить защиту прогресса без сессии**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/progress`
Expected: `401`.

> Полный сценарий входа через Telegram-виджет тестируется только на задеплоенном домене (виджет требует привязанный домен бота) — см. Task 24.

- [ ] **Step 6: Commit (если были фиксы)**

```bash
git add -A && git commit -m "chore: local vercel dev verification fixes" || echo "nothing to commit"
```

### Task 23: Переменные окружения в Vercel

**Files:** (нет)

- [ ] **Step 1: Сгенерировать JWT_SECRET**

Run: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
Expected: длинная hex-строка — это значение `JWT_SECRET`.

- [ ] **Step 2: Добавить переменные во все окружения**

```bash
vercel env add TELEGRAM_BOT_TOKEN production preview development
vercel env add TELEGRAM_BOT_USERNAME production preview development
vercel env add VITE_TELEGRAM_BOT_USERNAME production preview development
vercel env add JWT_SECRET production preview development
```
Для каждой команды CLI спросит значение. `DATABASE_URL` уже добавлен интеграцией Neon (Task 16). `VITE_TELEGRAM_BOT_USERNAME` и `TELEGRAM_BOT_USERNAME` — одинаковое значение (username без `@`).

- [ ] **Step 3: Проверить список**

Run: `vercel env ls`
Expected: в списке все пять переменных.

### Task 24: Деплой и финальная проверка сквозного входа

**Files:** (нет)

- [ ] **Step 1: Задеплоить в production**

Run: `vercel --prod`
Expected: CLI печатает production-URL (например `https://kvanta-quiz.vercel.app`).

- [ ] **Step 2: ОСТАНОВКА — действие пользователя**

Сообщить пользователю production-домен и попросить выполнить у @BotFather: `/setdomain` → выбрать бота → отправить домен (без `https://`, например `kvanta-quiz.vercel.app`). Без этого кнопка Telegram-виджета не отрисуется.

- [ ] **Step 3: Применить миграцию к production-БД (если ещё не применялась к этой БД)**

Run: `DATABASE_URL="<production db url>" node scripts/migrate.js`
Expected: `migrated: N statements`. (Если Neon-интеграция использует одну БД для всех окружений — миграция из Task 16 уже покрыла это.)

- [ ] **Step 4: Ручная сквозная проверка (пользователь, в браузере)**

Чек-лист:
1. Открыть production-URL → показывается экран входа с кнопкой «Log in with Telegram».
2. Нажать → авторизоваться в Telegram → попадание на дашборд с именем из Telegram.
3. Пройти квиз → результат отображается → перезагрузить страницу → попытка осталась в «Истории» (значит прогресс сохранён в БД).
4. Пройти трейд-тест → результат сохранился.
5. Выйти (logout) → снова экран входа; `GET /api/progress` без cookie даёт 401.

- [ ] **Step 5: Проверить, что email/пароль-входа нигде нет**

Run: `grep -rniE "пароль|password|email" src/ | grep -viE "telegram|//|/\*" || echo "clean"`
Expected: `clean` (или только несвязанные совпадения) — подтверждение, что классической авторизации не осталось.

- [ ] **Step 6: Commit и финал**

```bash
git add -A && git commit -m "chore: production deploy config" || echo "nothing to commit"
git log --oneline | head -25
```

---

## Self-Review

**1. Покрытие требований:**
- «Качественная кодовая база» → Phase 0–3: модульная структура (lib/components/screens/api), ESM вместо `window.*`, реальная сборка вместо Babel-в-браузере. ✅
- «Vercel serverless функции» → Phase 1/4/5: `/api/content`, `/api/auth/*`, `/api/progress`, `/api/attempts`, `/api/tradetest-result`. ✅
- «Авторизация через Telegram-бота» → Phase 4: Login Widget + проверка HMAC-подписи по токену бота + JWT-cookie. ✅
- «Авторизация ТОЛЬКО через тг» → AuthScreen удалён (Task 11 Step 2), новый `Auth.jsx` без полей email/пароль, проверка в Task 24 Step 5. ✅
- «Бота создаёшь сам» → уточнено в предусловиях: создание бота через @BotFather делает пользователь (агент технически не может писать в Telegram), весь код/webhook/верификация — на стороне агента. ✅
- «Дам токен» → токен живёт в env (`TELEGRAM_BOT_TOKEN`), не в коде; добавляется в Task 23. ✅

**2. Плейсхолдеры:** новый код (api, auth, telegram, db, quiz-хелперы, Auth.jsx, boot) дан полностью. Миграционные задачи (Task 7–11, 21) сознательно описаны как механические правки + дословное копирование тел из PROTO — воспроизводить ~2500 строк прототипа в плане нецелесообразно; вместо этого дана точная таблица замен и пер-файловые списки импортов.

**3. Согласованность типов/имён:** форма стора `{ user, attempts, qstats, wrong, days, bestStreak, ttBest }` едина в `buildStore` (Task 18), `App.jsx` (Task 21) и совпадает с PROTO. `isCorrect(q, ans)` — одинаковая сигнатура в `src/lib/quiz.js` и `api/_lib/quiz.js`. `api.*` методы (Task 6) соответствуют эндпоинтам (Phase 1/4/5). Cookie-имя `fq_session` едино в `auth.js`. `VITE_TELEGRAM_BOT_USERNAME` используется в `Auth.jsx` и задаётся в Task 1/23.

**Известные допущения (озвучить при исполнении):**
- Правильные ответы отдаются клиенту через `/api/content` (учебный проект, мгновенный разбор); анти-чит обеспечивается серверным пересчётом в `/api/attempts`.
- Neon-интеграция Vercel предполагается с единой БД; если окружения раздельные — миграцию нужно применить к каждой БД (Task 24 Step 3).
- Telegram-виджет работает только на привязанном домене — локально (Task 22) тестируются API, а полный вход — после деплоя (Task 24).
