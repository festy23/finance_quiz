# Multi-Quiz Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить одно-квизовый тренажёр по финансам в платформу, которая хостит любое число квизов (начиная с финансов и матстата), переиспользуя весь текущий фронтенд, оформление карточек и движок квиза.

**Architecture:** Каждый квиз — самодостаточный контент-модуль (`api/_data/<quizId>/`) с манифестом (бренд, акцент, фичи, топики, вопросы, словарь, ачивки). Бэкенд-реестр (`registry.js`) отдаёт каталог квизов (`/api/quizzes`) и контент одного квиза (`/api/content?quiz=<id>`). Прогресс в БД разделён по `quiz_id`. Фронтенд получает слой-каталог (лендинг с карточками) и роутинг по URL (`/`, `/finance`, `/matstat`); внутри квиза рендерится прежний `App`-шелл, но бренд/навигация/ачивки теперь data-driven из манифеста. Telegram-авторизация остаётся глобальной и не меняется.

**Tech Stack:** Vite + React 18 (SPA, без react-router — мини-роутер на `location.pathname` + `history`), Vercel serverless (Node ESM), Neon Postgres, Vitest (env: node — только чистые функции тестируются).

---

## Архитектурные решения (зафиксированы с заказчиком)

1. **Навигация:** каталог-лендинг со списком квизов + URL-роуты (`/<quizId>`). Внутри квиза — возврат «← Все квизы».
2. **Контент матстата:** каркас + 3 топика + ~7 вопросов-образцов + словарь ~11 терминов (полный банк добавится позже по готовому шаблону).
3. **Объём:** инфраструктура мульти-квиза + матстат как первый новый квиз — в одном плане.
4. **Viz матстата:** 2 интерактивные демо-визуализации (`normaldist`, `clt`).

## File Structure

**Backend (новое / реструктуризация):**
- `api/_data/modes.js` — *создать*. Общие режимы квиза (`DEFAULT_MODES`), DRY между квизами.
- `api/_data/finance/questions.js` — *переместить из* `api/_data/questions.js` (убрать экспорт `MODES`).
- `api/_data/finance/glossary.js` — *переместить из* `api/_data/glossary.js`.
- `api/_data/finance/tradetest.js` — *переместить из* `api/_data/tradetest.js`.
- `api/_data/finance/achievements.js` — *создать*. Декларативные определения ачивок финансов.
- `api/_data/finance/manifest.js` — *создать*. Манифест квиза «финансы».
- `api/_data/matstat/questions.js` · `glossary.js` · `achievements.js` · `manifest.js` — *создать*. Квиз «матстат».
- `api/_data/registry.js` — *создать*. Реестр квизов: `listQuizzes()`, `getQuiz(id)`, `DEFAULT_QUIZ`.
- `api/_lib/quiz.js` — *модифицировать*. Добавить чистую `scoreAttempt(quiz, qids, answers)`.
- `api/_lib/schema.sql` — *модифицировать*. Namespacing по `quiz_id`.
- `api/quizzes.js` — *создать*. `GET /api/quizzes` — каталог.
- `api/content.js` · `api/progress.js` · `api/attempts.js` · `api/tradetest-result.js` — *модифицировать*. Параметр `quiz`.

**Frontend (новое / модификация):**
- `src/lib/platform.js` — *создать*. Бренд платформы для каталога.
- `src/lib/route.js` — *создать*. Парсинг роута из `pathname`.
- `src/lib/achievements.js` — *создать*. Чистая оценка ачивок по правилам.
- `src/lib/api.js` — *модифицировать*. `quizzes()`, `content(quiz)`, `progress(quiz)`, `saveAttempt`/`saveTradeResult` с `quiz`.
- `src/lib/content.js` — *модифицировать*. Расширить синглтон: `brand`, `accent`, `features`, `achievements`, `quizId`.
- `src/components/viz/matstat.jsx` — *создать*. Viz `normaldist`, `clt`.
- `src/components/viz/index.js` — *модифицировать*. Подмешать `VIZ_MATSTAT`.
- `src/screens/Catalog.jsx` — *создать*. Лендинг с карточками квизов.
- `src/screens/Root.jsx` — *создать*. Верхнеуровневый роутер (каталог ↔ квиз).
- `src/App.jsx` — *модифицировать*. Принимает манифест: бренд, фичи-навигация, data-driven ачивки, quiz-aware действия.
- `src/main.jsx` — *модифицировать*. Грузит `me`, рендерит `<Root>`.

**Tests (новые):**
- `test/registry.test.js`, `test/achievements.test.js`, `test/route.test.js`, `test/score.test.js`.

---

## Phase 1 — Backend multi-quiz foundation

### Task 1: Общие режимы + реструктуризация данных финансов

**Files:**
- Create: `api/_data/modes.js`
- Move: `api/_data/questions.js` → `api/_data/finance/questions.js`
- Move: `api/_data/glossary.js` → `api/_data/finance/glossary.js`
- Move: `api/_data/tradetest.js` → `api/_data/finance/tradetest.js`

- [ ] **Step 1: Создать общий модуль режимов**

Create `api/_data/modes.js`:

```js
/* modes.js — общие режимы тренировки для всех квизов (DRY). */
export const DEFAULT_MODES = {
  full:   { id: "full",   name: "Полный экзамен", desc: "Все вопросы блока. Проверка ответов — в конце.", icon: "exam", feedback: "end",   count: null },
  quick:  { id: "quick",  name: "Быстрый",        desc: "10 случайных вопросов. Мгновенная проверка.",     icon: "bolt", feedback: "instant", count: 10 },
  repeat: { id: "repeat", name: "Повторение",     desc: "Только темы, где вы ошибались. Интервальный повтор.", icon: "repeat", feedback: "instant", count: 12 },
};
```

- [ ] **Step 2: Переместить файлы данных финансов в подпапку**

Run:
```bash
mkdir -p api/_data/finance
git mv api/_data/questions.js api/_data/finance/questions.js
git mv api/_data/glossary.js api/_data/finance/glossary.js
git mv api/_data/tradetest.js api/_data/finance/tradetest.js
```

- [ ] **Step 3: Убрать `MODES` из questions.js (теперь общий)**

In `api/_data/finance/questions.js`, удалить блок в конце файла:

```js
/* Quiz modes */
export const MODES = {
  full:   { id: "full",   name: "Полный экзамен", desc: "Все вопросы блока. Проверка ответов — в конце.", icon: "exam", feedback: "end",   count: null },
  quick:  { id: "quick",  name: "Быстрый",        desc: "10 случайных вопросов. Мгновенная проверка.",     icon: "bolt", feedback: "instant", count: 10 },
  repeat: { id: "repeat", name: "Повторение",     desc: "Только темы, где вы ошибались. Интервальный повтор.", icon: "repeat", feedback: "instant", count: 12 },
};
```

Файл теперь экспортирует только `TOPICS` и `QUESTIONS`.

- [ ] **Step 4: Commit**

```bash
git add api/_data
git commit -m "refactor: per-quiz data folder + shared modes module"
```

---

### Task 2: Манифест финансов + ачивки + реестр квизов

**Files:**
- Create: `api/_data/finance/achievements.js`
- Create: `api/_data/finance/manifest.js`
- Create: `api/_data/registry.js`
- Test: `test/registry.test.js`

- [ ] **Step 1: Написать падающий тест реестра**

Create `test/registry.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { listQuizzes, getQuiz, DEFAULT_QUIZ } from '../api/_data/registry.js'

describe('quiz registry', () => {
  it('DEFAULT_QUIZ is finance', () => {
    expect(DEFAULT_QUIZ).toBe('finance')
  })

  it('listQuizzes returns lightweight catalog entries with counts', () => {
    const list = listQuizzes()
    const finance = list.find((q) => q.id === 'finance')
    expect(finance).toBeTruthy()
    expect(finance.title).toBeTruthy()
    expect(finance.questionCount).toBeGreaterThan(0)
    expect(finance.topicCount).toBeGreaterThan(0)
    // каталог не должен тащить тяжёлые массивы
    expect(finance.questions).toBeUndefined()
    expect(finance.glossary).toBeUndefined()
  })

  it('getQuiz returns full manifest or null', () => {
    const q = getQuiz('finance')
    expect(q.questions.length).toBeGreaterThan(0)
    expect(q.modes.full).toBeTruthy()
    expect(q.achievements.length).toBeGreaterThan(0)
    expect(getQuiz('nope')).toBeNull()
  })
})
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npm test -- registry`
Expected: FAIL — `Cannot find module '../api/_data/registry.js'`.

- [ ] **Step 3: Написать ачивки финансов**

Create `api/_data/finance/achievements.js`:

```js
/* achievements.js — декларативные ачивки финансового квиза.
   rule — одно из правил, понимаемых src/lib/achievements.js:
     { kind: 'attempts', n }
     { kind: 'totalAnswered', n }
     { kind: 'accuracy', n, pct }        // ответов >= n И точность >= pct%
     { kind: 'perfectSession', size }    // была сессия score===total и total>=size
     { kind: 'streak', days }
     { kind: 'topicMastery', topic, pct }
     { kind: 'allTopicsMastery', pct } */
export const FINANCE_ACHIEVEMENTS = [
  { id: "first",   name: "Первый шаг", desc: "Пройти первый квиз",          icon: "play",  color: "var(--ac)",     rule: { kind: "attempts", n: 1 } },
  { id: "ta",      name: "Чартист",    desc: "Освоить тех. анализ на 50%",   icon: "trend", color: "var(--warn)",   rule: { kind: "topicMastery", topic: "ta", pct: 50 } },
  { id: "streak",  name: "В ритме",    desc: "Серия 3 дня",                  icon: "flame", color: "var(--down)",   rule: { kind: "streak", days: 3 } },
  { id: "perfect", name: "Без ошибок", desc: "100% в сессии 5+",             icon: "target",color: "var(--ok)",     rule: { kind: "perfectSession", size: 5 } },
  { id: "ten",     name: "Десятка",    desc: "50 ответов",                   icon: "layers",color: "var(--purple)", rule: { kind: "totalAnswered", n: 50 } },
  { id: "scholar", name: "Эрудит",     desc: "Освоить все блоки на 60%",     icon: "brain", color: "var(--ac)",     rule: { kind: "allTopicsMastery", pct: 60 } },
  { id: "fund",    name: "Аналитик",   desc: "Фунд. анализ 70%",             icon: "chart", color: "var(--ac)",     rule: { kind: "topicMastery", topic: "fa", pct: 70 } },
  { id: "ace",     name: "Снайпер",    desc: "Точность 90%+",                icon: "star",  color: "var(--warn)",   rule: { kind: "accuracy", n: 10, pct: 90 } },
];
```

- [ ] **Step 4: Написать манифест финансов**

Create `api/_data/finance/manifest.js`:

```js
import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { TRADETEST } from './tradetest.js'
import { FINANCE_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const financeQuiz = {
  id: "finance",
  title: "Финансы и трейдинг",
  tagline: "Личные финансы, отчётность, фундаментальный и технический анализ",
  brand: { name: "67quant", sub: "тренажёр по финансам" },
  accent: "#3b76ff",
  icon: "chart",
  features: { glossary: true, tradetest: true },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: TRADETEST,
  achievements: FINANCE_ACHIEVEMENTS,
}
```

- [ ] **Step 5: Написать реестр**

Create `api/_data/registry.js`:

```js
import { financeQuiz } from './finance/manifest.js'

// Порядок здесь = порядок карточек в каталоге.
const QUIZZES = [financeQuiz]
const BY_ID = new Map(QUIZZES.map((q) => [q.id, q]))

export const DEFAULT_QUIZ = 'finance'

// Лёгкий список для каталога — без тяжёлых массивов вопросов/словаря.
export function listQuizzes() {
  return QUIZZES.map((q) => ({
    id: q.id,
    title: q.title,
    tagline: q.tagline,
    accent: q.accent,
    icon: q.icon,
    features: q.features,
    topicCount: q.topics.length,
    questionCount: q.questions.length,
  }))
}

export function getQuiz(id) {
  return BY_ID.get(id) || null
}
```

- [ ] **Step 6: Запустить тест — убедиться, что проходит**

Run: `npm test -- registry`
Expected: PASS (3 теста).

- [ ] **Step 7: Commit**

```bash
git add api/_data/registry.js api/_data/finance/manifest.js api/_data/finance/achievements.js test/registry.test.js
git commit -m "feat: quiz registry + finance manifest with data-driven achievements"
```

---

### Task 3: Чистая функция подсчёта попытки `scoreAttempt`

**Files:**
- Modify: `api/_lib/quiz.js`
- Test: `test/score.test.js`

- [ ] **Step 1: Написать падающий тест**

Create `test/score.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { scoreAttempt } from '../api/_lib/quiz.js'

const quiz = {
  questions: [
    { id: 'q1', correct: [0] },
    { id: 'q2', correct: [1, 2] },
    { id: 'q3', correct: [3] },
  ],
}

describe('scoreAttempt', () => {
  it('считает счёт, spark и список верных/неверных', () => {
    const r = scoreAttempt(quiz, ['q1', 'q2', 'q3'], { q1: [0], q2: [2, 1], q3: [0] })
    expect(r.score).toBe(2)
    expect(r.spark).toEqual([100, 100, 20])
    expect(r.results.map((x) => x.ok)).toEqual([true, true, false])
  })

  it('неизвестные id трактуются как неверные (spark 20)', () => {
    const r = scoreAttempt(quiz, ['ghost'], { ghost: [0] })
    expect(r.score).toBe(0)
    expect(r.spark).toEqual([20])
    expect(r.results[0].ok).toBe(false)
  })
})
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- score`
Expected: FAIL — `scoreAttempt is not a function`.

- [ ] **Step 3: Реализовать `scoreAttempt`**

In `api/_lib/quiz.js`, добавить в конец файла:

```js
// Чистый подсчёт попытки. quiz.questions — массив {id, correct}.
// Возвращает { score, spark, results:[{id, ok}] }. Неизвестные id — неверные.
export function scoreAttempt(quiz, qids, answers) {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]))
  let score = 0
  const spark = []
  const results = []
  for (const id of qids) {
    const q = byId.get(id)
    const ok = !!q && isCorrect(q, answers[id])
    if (ok) score++
    spark.push(ok ? 100 : 20)
    results.push({ id, ok })
  }
  return { score, spark, results }
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm test -- score`
Expected: PASS (2 теста).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/quiz.js test/score.test.js
git commit -m "feat: pure scoreAttempt helper for quiz-namespaced scoring"
```

---

### Task 4: Namespacing БД по `quiz_id`

**Files:**
- Modify: `api/_lib/schema.sql`

- [ ] **Step 1: Добавить namespacing-секцию в схему**

In `api/_lib/schema.sql`, в самый конец файла добавить (идемпотентно — безопасно и для свежей, и для существующей БД с финансовыми данными):

```sql
-- ── multi-quiz namespacing ───────────────────────────────────────────────
-- Существующие строки = финансовый квиз; новым колонкам ставим default 'finance'.

alter table attempts add column if not exists quiz_id text not null default 'finance';
create index if not exists attempts_user_quiz_idx on attempts(user_id, quiz_id, created_at desc);

alter table qstats add column if not exists quiz_id text not null default 'finance';
alter table qstats drop constraint if exists qstats_pkey;
alter table qstats add primary key (user_id, quiz_id, question_id);

alter table wrong add column if not exists quiz_id text not null default 'finance';
alter table wrong drop constraint if exists wrong_pkey;
alter table wrong add primary key (user_id, quiz_id, question_id);

alter table days add column if not exists quiz_id text not null default 'finance';
alter table days drop constraint if exists days_pkey;
alter table days add primary key (user_id, quiz_id, day);

alter table user_meta add column if not exists quiz_id text not null default 'finance';
alter table user_meta drop constraint if exists user_meta_pkey;
alter table user_meta add primary key (user_id, quiz_id);
```

> Примечание: `scripts/migrate.js` бьёт DDL по `;` и выполняет каждый стейтмент — менять скрипт не нужно. На существующей БД миграция применяется через `npm run migrate` после `vercel env pull .env` (см. README, шаг 4).

- [ ] **Step 2: Проверить, что схема парсится корректно (без БД)**

Run:
```bash
node -e "import('node:fs').then(fs=>{const s=fs.readFileSync('api/_lib/schema.sql','utf8').split(';').map(x=>x.trim()).filter(Boolean);console.log('statements:',s.length); if(s.some(x=>!x)) throw new Error('empty stmt'); console.log('ok')})"
```
Expected: печатает число стейтментов и `ok` (без ошибок парсинга).

- [ ] **Step 3: Commit**

```bash
git add api/_lib/schema.sql
git commit -m "feat(db): namespace attempts/qstats/wrong/days/user_meta by quiz_id"
```

---

### Task 5: API — параметр `quiz` во всех эндпоинтах прогресса

**Files:**
- Create: `api/quizzes.js`
- Modify: `api/content.js`
- Modify: `api/progress.js`
- Modify: `api/attempts.js`
- Modify: `api/tradetest-result.js`

- [ ] **Step 1: Эндпоинт каталога**

Create `api/quizzes.js`:

```js
import { listQuizzes } from './_data/registry.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({ quizzes: listQuizzes() })
}
```

- [ ] **Step 2: `/api/content` отдаёт контент выбранного квиза**

Replace entire `api/content.js`:

```js
import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  const id = req.query?.quiz || DEFAULT_QUIZ
  const q = getQuiz(id)
  if (!q) return res.status(404).json({ error: 'quiz not found' })
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
  res.json({
    quizId: q.id,
    brand: q.brand,
    accent: q.accent,
    features: q.features,
    topics: q.topics,
    questions: q.questions,
    modes: q.modes,
    glossary: q.features.glossary ? q.glossary : [],
    tradetest: q.features.tradetest ? q.tradetest : [],
    achievements: q.achievements,
  })
}
```

- [ ] **Step 3: `/api/progress` фильтрует по `quiz_id`**

In `api/progress.js`, заменить тело `handler` (строки после `const uid = u.id`) так, чтобы все запросы фильтровались по квизу. Полная новая версия `handler` (функция `buildStore` выше по файлу — без изменений):

```js
export default async function handler(req, res) {
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })
  const uid = u.id
  const quiz = req.query?.quiz || 'finance'

  const [attempts, qstatsRows, wrongRows, dayRows, metaRows, userRows] = await Promise.all([
    sql`select id, mode, topic, score, total, qids, answers, spark, created_at from attempts where user_id = ${uid} and quiz_id = ${quiz} order by created_at desc limit 60`,
    sql`select question_id, seen, correct from qstats where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select question_id from wrong where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select day, answered from days where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select best_streak, tt_best from user_meta where user_id = ${uid} and quiz_id = ${quiz}`,
    sql`select avatar_url from users where id = ${uid}`,
  ])

  res.json(buildStore({
    user: { id: u.id, name: u.name, photo_url: userRows[0]?.avatar_url || u.photo_url },
    attempts, qstatsRows, wrongRows, dayRows, meta: metaRows[0] || {},
  }))
}
```

> `buildStore` и `test/progress.test.js` не меняются — форма стора прежняя.

- [ ] **Step 4: `/api/attempts` пишет в namespace квиза**

Replace entire `api/attempts.js`:

```js
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak, scoreAttempt } from './_lib/quiz.js'
import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const { quiz: quizId = DEFAULT_QUIZ, mode, topic = null, qids, answers, date } = req.body || {}
  if (!Array.isArray(qids) || typeof answers !== 'object' || !answers) {
    return res.status(400).json({ error: 'bad request' })
  }
  const quiz = getQuiz(quizId)
  if (!quiz) return res.status(404).json({ error: 'quiz not found' })

  const uid = u.id
  const when = date || Date.now()
  const { score, spark, results } = scoreAttempt(quiz, qids, answers)

  for (const { id, ok } of results) {
    await sql`
      insert into qstats (user_id, quiz_id, question_id, seen, correct)
      values (${uid}, ${quizId}, ${id}, 1, ${ok ? 1 : 0})
      on conflict (user_id, quiz_id, question_id) do update
        set seen = qstats.seen + 1, correct = qstats.correct + ${ok ? 1 : 0}`
    if (ok) {
      await sql`delete from wrong where user_id = ${uid} and quiz_id = ${quizId} and question_id = ${id}`
    } else {
      await sql`insert into wrong (user_id, quiz_id, question_id) values (${uid}, ${quizId}, ${id}) on conflict do nothing`
    }
  }

  const attemptId = 'a' + quizId + '-' + when
  await sql`
    insert into attempts (id, user_id, quiz_id, mode, topic, score, total, qids, answers, spark)
    values (${attemptId}, ${uid}, ${quizId}, ${mode}, ${topic}, ${score}, ${qids.length},
            ${JSON.stringify(qids)}::jsonb, ${JSON.stringify(answers)}::jsonb, ${JSON.stringify(spark)}::jsonb)
    on conflict (id) do nothing`

  const day = dayKey(when)
  await sql`
    insert into days (user_id, quiz_id, day, answered) values (${uid}, ${quizId}, ${day}, ${qids.length})
    on conflict (user_id, quiz_id, day) do update set answered = days.answered + ${qids.length}`

  const dayRows = await sql`select day from days where user_id = ${uid} and quiz_id = ${quizId}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))
  await sql`
    insert into user_meta (user_id, quiz_id, best_streak) values (${uid}, ${quizId}, ${streak})
    on conflict (user_id, quiz_id) do update set best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ attempt: { id: attemptId, mode, topic, score, total: qids.length, date: when, qids, answers, spark } })
}
```

- [ ] **Step 5: `/api/tradetest-result` пишет в namespace квиза**

Replace entire `api/tradetest-result.js`:

```js
import { sql } from './_lib/db.js'
import { requireUser } from './_lib/auth.js'
import { computeStreak } from './_lib/quiz.js'
import { getQuiz, DEFAULT_QUIZ } from './_data/registry.js'

const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  const u = await requireUser(req)
  if (!u) return res.status(401).json({ error: 'unauthorized' })

  const quizId = req.body?.quiz || DEFAULT_QUIZ
  const quiz = getQuiz(quizId)
  if (!quiz || !quiz.features.tradetest) return res.status(404).json({ error: 'tradetest not available' })

  const score = Number(req.body?.score)
  if (!Number.isFinite(score)) return res.status(400).json({ error: 'bad request' })
  const uid = u.id
  const day = dayKey(Date.now())
  const n = quiz.tradetest.length

  await sql`
    insert into days (user_id, quiz_id, day, answered) values (${uid}, ${quizId}, ${day}, ${n})
    on conflict (user_id, quiz_id, day) do update set answered = days.answered + ${n}`

  const dayRows = await sql`select day from days where user_id = ${uid} and quiz_id = ${quizId}`
  const streak = computeStreak(dayRows.map((r) => String(r.day).slice(0, 10)))

  await sql`
    insert into user_meta (user_id, quiz_id, best_streak, tt_best) values (${uid}, ${quizId}, ${streak}, ${score})
    on conflict (user_id, quiz_id) do update
      set tt_best = greatest(coalesce(user_meta.tt_best, 0), ${score}),
          best_streak = greatest(user_meta.best_streak, ${streak})`

  res.json({ ttBest: score, ok: true })
}
```

- [ ] **Step 6: Прогнать весь тест-сьют (бэкенд-логика не должна сломать существующие тесты)**

Run: `npm test`
Expected: PASS — существующие сьюты (`auth`, `progress`, `quiz`, `telegram`) + новые (`registry`, `score`) зелёные.

- [ ] **Step 7: Commit**

```bash
git add api/quizzes.js api/content.js api/progress.js api/attempts.js api/tradetest-result.js
git commit -m "feat(api): quiz param across content/progress/attempts/tradetest + /api/quizzes"
```

---

## Phase 2 — Frontend platform shell

### Task 6: API-клиент — мульти-квиз методы

**Files:**
- Modify: `src/lib/api.js`

- [ ] **Step 1: Расширить клиент**

Replace entire `src/lib/api.js`:

```js
const json = (r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
const post = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })

export const api = {
  quizzes: () => fetch('/api/quizzes').then(json),
  content: (quiz) => fetch('/api/content?quiz=' + encodeURIComponent(quiz)).then(json),
  me: () => fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
  authStart: () => post('/api/auth/start').then(json),
  authPoll: (token) => post('/api/auth/poll', { token }).then(json),
  logout: () => post('/api/auth/logout'),
  progress: (quiz) => fetch('/api/progress?quiz=' + encodeURIComponent(quiz)).then(json),
  saveAttempt: (quiz, attempt) => post('/api/attempts', { quiz, ...attempt }).then(json),
  saveTradeResult: (quiz, score) => post('/api/tradetest-result', { quiz, score }).then(json),
  uploadAvatar: (dataUrl) => post('/api/avatar', { dataUrl }).then(json),
}
```

> Сигнатуры `content`/`progress`/`saveAttempt`/`saveTradeResult` теперь требуют `quiz` — потребители обновляются в Task 8/10/12.

- [ ] **Step 2: Сборка не падает (типов нет, проверяем парс)**

Run: `npm run build`
Expected: SUCCESS (сборка проходит; рантайм-потребители обновим в следующих тасках — но синтаксис валиден).

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.js
git commit -m "feat(api-client): quiz-aware content/progress/save methods + quizzes()"
```

---

### Task 7: Роутер по URL

**Files:**
- Create: `src/lib/route.js`
- Test: `test/route.test.js`

- [ ] **Step 1: Написать падающий тест**

Create `test/route.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { parseRoute, quizPath } from '../src/lib/route.js'

describe('parseRoute', () => {
  it('корень = каталог', () => {
    expect(parseRoute('/')).toEqual({ view: 'catalog', quizId: null })
    expect(parseRoute('')).toEqual({ view: 'catalog', quizId: null })
  })
  it('сегмент = квиз', () => {
    expect(parseRoute('/matstat')).toEqual({ view: 'quiz', quizId: 'matstat' })
    expect(parseRoute('/finance/')).toEqual({ view: 'quiz', quizId: 'finance' })
  })
  it('quizPath строит путь', () => {
    expect(quizPath('matstat')).toBe('/matstat')
  })
})
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- route`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать роутер**

Create `src/lib/route.js`:

```js
// Мини-роутер: путь '/' → каталог, '/<quizId>' → квиз. Без react-router.
export function parseRoute(pathname) {
  const seg = String(pathname || '/').replace(/^\/+|\/+$/g, '').split('/')[0]
  return seg ? { view: 'quiz', quizId: seg } : { view: 'catalog', quizId: null }
}

export function quizPath(id) {
  return '/' + id
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm test -- route`
Expected: PASS (3 теста).

- [ ] **Step 5: Commit**

```bash
git add src/lib/route.js test/route.test.js
git commit -m "feat: URL route parsing for catalog vs quiz"
```

---

### Task 8: Расширить контент-синглтон под манифест

**Files:**
- Modify: `src/lib/content.js`

- [ ] **Step 1: Добавить поля манифеста в синглтон**

Replace entire `src/lib/content.js`:

```js
// Синглтон контента. Заполняется один раз при входе в квиз (Root) до рендера App,
// поэтому экраны читают C.* синхронно (как раньше window.*).
export const C = {
  quizId: null, brand: { name: "", sub: "" }, accent: "#3b76ff", features: {},
  topics: [], questions: [], modes: {}, glossary: [], tradetest: [], achievements: [],
}

export function initContent(data) {
  C.quizId = data.quizId || null
  C.brand = data.brand || { name: "", sub: "" }
  C.accent = data.accent || "#3b76ff"
  C.features = data.features || {}
  C.topics = data.topics || []
  C.questions = data.questions || []
  C.modes = data.modes || {}
  C.glossary = data.glossary || []
  C.tradetest = data.tradetest || []
  C.achievements = data.achievements || []
}
```

- [ ] **Step 2: Существующие тесты квиза не сломаны**

Run: `npm test -- quiz`
Expected: PASS — `test/quiz.test.js` присваивает `C.questions`/`C.topics` напрямую; новые поля не мешают.

- [ ] **Step 3: Commit**

```bash
git add src/lib/content.js
git commit -m "feat(content): extend singleton with brand/accent/features/achievements/quizId"
```

---

### Task 9: Чистая оценка ачивок

**Files:**
- Create: `src/lib/achievements.js`
- Test: `test/achievements.test.js`

- [ ] **Step 1: Написать падающий тест**

Create `test/achievements.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildMetrics, buildAchievements } from '../src/lib/achievements.js'

const topics = [{ id: 'a' }, { id: 'b' }]
const stats = {
  a: { answered: 6, correct: 5, mastery: 50 },
  b: { answered: 4, correct: 4, mastery: 80 },
}
const attempts = [{ score: 5, total: 5 }, { score: 2, total: 5 }]

describe('achievements', () => {
  it('buildMetrics агрегирует totals/accuracy/perfect', () => {
    const m = buildMetrics({ stats, topics, attempts, bestStreak: 4 })
    expect(m.totalAnswered).toBe(10)
    expect(m.totalCorrect).toBe(9)
    expect(m.accuracy).toBe(90)
    expect(m.perfectMaxSize).toBe(5)
    expect(m.bestStreak).toBe(4)
    expect(m.masteryByTopic.b).toBe(80)
  })

  it('buildAchievements оценивает каждое правило', () => {
    const defs = [
      { id: 'first', rule: { kind: 'attempts', n: 1 } },
      { id: 'ten', rule: { kind: 'totalAnswered', n: 50 } },
      { id: 'ace', rule: { kind: 'accuracy', n: 10, pct: 90 } },
      { id: 'perfect', rule: { kind: 'perfectSession', size: 5 } },
      { id: 'streak', rule: { kind: 'streak', days: 3 } },
      { id: 'tmA', rule: { kind: 'topicMastery', topic: 'a', pct: 50 } },
      { id: 'tmB', rule: { kind: 'topicMastery', topic: 'b', pct: 90 } },
      { id: 'all', rule: { kind: 'allTopicsMastery', pct: 60 } },
    ]
    const got = Object.fromEntries(
      buildAchievements(defs, buildMetrics({ stats, topics, attempts, bestStreak: 4 })).map((a) => [a.id, a.got])
    )
    expect(got).toEqual({
      first: true, ten: false, ace: true, perfect: true,
      streak: true, tmA: true, tmB: false, all: false,
    })
  })
})
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- achievements`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать**

Create `src/lib/achievements.js`:

```js
// Чистая оценка ачивок. Отделена от UI, поэтому тестируется в node-окружении.

// Сводит computeStats + список попыток в плоский набор метрик для правил.
export function buildMetrics({ stats, topics, attempts, bestStreak }) {
  const totalAnswered = topics.reduce((a, t) => a + (stats[t.id]?.answered || 0), 0)
  const totalCorrect = topics.reduce((a, t) => a + (stats[t.id]?.correct || 0), 0)
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const perfectMaxSize = attempts.reduce(
    (mx, a) => (a.score === a.total && a.total > mx ? a.total : mx), 0
  )
  const masteryByTopic = {}
  for (const t of topics) masteryByTopic[t.id] = stats[t.id]?.mastery || 0
  const allTopicsMinMastery = topics.length
    ? Math.min(...topics.map((t) => stats[t.id]?.mastery || 0)) : 0
  return {
    totalAnswered, totalCorrect, accuracy, perfectMaxSize,
    attemptsCount: attempts.length, bestStreak: bestStreak || 0,
    masteryByTopic, allTopicsMinMastery,
  }
}

export function evalRule(rule, m) {
  switch (rule.kind) {
    case 'attempts':         return m.attemptsCount >= rule.n
    case 'totalAnswered':    return m.totalAnswered >= rule.n
    case 'accuracy':         return m.totalAnswered >= rule.n && m.accuracy >= rule.pct
    case 'perfectSession':   return m.perfectMaxSize >= rule.size
    case 'streak':           return m.bestStreak >= rule.days
    case 'topicMastery':     return (m.masteryByTopic[rule.topic] || 0) >= rule.pct
    case 'allTopicsMastery': return m.allTopicsMinMastery >= rule.pct
    default:                 return false
  }
}

export function buildAchievements(defs, metrics) {
  return defs.map((d) => ({ ...d, got: evalRule(d.rule, metrics) }))
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm test -- achievements`
Expected: PASS (2 теста).

- [ ] **Step 5: Commit**

```bash
git add src/lib/achievements.js test/achievements.test.js
git commit -m "feat: data-driven achievement evaluation (pure)"
```

---

### Task 10: `App.jsx` — quiz-aware шелл (бренд, фичи-навигация, data-driven ачивки)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Импорты — подключить ачивки, route, и `paletteFor`**

In `src/App.jsx`, заменить блок импортов (строки 1–13) на:

```jsx
/* App.jsx — store, router, app shell (desktop sidebar / mobile tabbar), tweaks. */
import React, { useState as uS, useEffect as uE, useMemo } from 'react'
import { api } from './lib/api.js'
import { C } from './lib/content.js'
import { QData, computeStats, computeStreak, dayKey, isCorrect, withShuffledOptions } from './lib/quiz.js'
import { buildMetrics, buildAchievements } from './lib/achievements.js'
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from './components/tweaks.jsx'
import { I, Logo, Btn } from './components/ui.jsx'
import Auth from './screens/Auth.jsx'
import { Dashboard } from './screens/Dashboard.jsx'
import { ModesScreen, LearnScreen, ProgressScreen, HistoryScreen } from './screens/LearnStats.jsx'
import { GlossaryScreen, TradeTestScreen } from './screens/Extra.jsx'
import { QuizScreen, ResultScreen } from './screens/Quiz.jsx'
import { ProfileScreen } from './screens/Profile.jsx'
```

- [ ] **Step 2: Заменить фиксированную палитру акцентов на генератор `paletteFor`**

In `src/App.jsx`, заменить блок `ACCENTS` (строки 15–20) на:

```jsx
/* ---------- accent palette derived from any hex (works with white button text) ---------- */
function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function paletteFor(hex) {
  const [r, g, b] = hexToRgb(hex);
  const hi = `rgb(${Math.min(255, r + 32)},${Math.min(255, g + 32)},${Math.min(255, b + 32)})`;
  return { hi, dim: `rgba(${r},${g},${b},.16)`, line: `rgba(${r},${g},${b},.45)` };
}
```

- [ ] **Step 3: Принять `quizId`, добавить дефолт акцента из манифеста, навигацию по фичам**

In `src/App.jsx`, заменить сигнатуру и начало `App` (строки 30–46) — блок `TWEAK_DEFAULTS` и объявление `App`:

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3b76ff",
  "font": "plex",
  "density": "regular",
  "vizInQuiz": true
}/*EDITMODE-END*/;

export default function App({ quizId, initialUser, initialStore, onExitQuiz }) {
  // Акцент по умолчанию берём из манифеста квиза (C.accent); пользователь может переопределить в tweaks.
  const tweakDefaults = useMemo(() => ({ ...TWEAK_DEFAULTS, accent: C.accent || TWEAK_DEFAULTS.accent }), []);
  const [t, setTweak] = useTweaks(tweakDefaults);
  const [store, setStore] = uS(initialStore || EMPTY);
  const [screen, setScreen] = uS(initialUser ? "dashboard" : "auth");
  const [quiz, setQuiz] = uS(null);
  const [lastResult, setLastResult] = uS(null);
  const [learnTopic, setLearnTopic] = uS(null);
  const [moreOpen, setMoreOpen] = uS(false);
  const [winW, setWinW] = uS(window.innerWidth);
  uE(() => { const f = () => setWinW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
```

- [ ] **Step 4: Quiz-aware действия — прокинуть `quizId` в API-вызовы**

In `src/App.jsx`, в объекте `ctx`, заменить три места, где вызывается API:

`ctx.login` (строки ~58–63):
```jsx
    login: async () => {
      // сессия уже выставлена /api/auth/poll — остаётся подтянуть прогресс этого квиза
      const progress = await api.progress(quizId)
      setStore(progress)
      setScreen("dashboard")
    },
```

`ctx.recordTradeResult` (внутри, строка ~76):
```jsx
      api.saveTradeResult(quizId, sc).catch(() => {})
```

`ctx.finishQuiz` сохранение попытки (строка ~101):
```jsx
      api.saveAttempt(quizId, { mode: qz.mode, topic: qz.topic, qids: attempt.qids, answers, date: attempt.date }).catch(() => {})
```

- [ ] **Step 5: Заменить хардкод ачивок на data-driven**

In `src/App.jsx`, заменить весь метод `achievements:` в `ctx` (строки ~117–131) на:

```jsx
    achievements: () => {
      const metrics = buildMetrics({ stats, topics: C.topics, attempts: store.attempts, bestStreak: ctx.bestStreak() });
      return buildAchievements(C.achievements, metrics);
    },
```

- [ ] **Step 6: Палитра темы из `paletteFor`**

In `src/App.jsx`, заменить строку формирования палитры (строка ~135):

```jsx
  const ac = paletteFor(t.accent);
```

- [ ] **Step 7: Навигация по фичам + бренд из манифеста + выход в каталог**

In `src/App.jsx`, заменить блоки `NAVMAP`/`GROUPS`/`MOBILE_*` (строки ~145–162) на фичи-зависимые:

```jsx
  const NAVMAP = {
    dashboard: { label: "Главная", icon: "home" },
    modes: { label: "Тренировка", icon: "play" },
    tradetest: { label: "Трейд-тест", icon: "trend" },
    learn: { label: "Изучение", icon: "brain" },
    glossary: { label: "Словарь", icon: "book" },
    progress: { label: "Прогресс", icon: "chart" },
    history: { label: "История", icon: "history" },
  };
  const feat = C.features || {};
  const GROUPS = [
    { items: ["dashboard"] },
    { label: "Практика", items: ["modes", ...(feat.tradetest ? ["tradetest"] : [])] },
    { label: "Материалы", items: ["learn", ...(feat.glossary ? ["glossary"] : [])] },
    { label: "Статистика", items: ["progress", "history"] },
  ];
  const MOBILE_PRIMARY = ["dashboard", "modes", ...(feat.tradetest ? ["tradetest"] : ["learn"])].slice(0, 4);
  const MOBILE_MORE = [...(feat.tradetest ? ["learn"] : []), ...(feat.glossary ? ["glossary"] : []), "progress", "history"];
  const titleOf = { ...Object.fromEntries(Object.entries(NAVMAP).map(([k, v]) => [k, v.label])), result: "Результат", quiz: "Квиз", profile: "Профиль" };
```

- [ ] **Step 8: Бренд в сайдбаре + кнопка «Все квизы»**

In `src/App.jsx`, заменить блок `.brand` в сайдбаре (строка ~190) на бренд из манифеста и кнопку выхода в каталог:

```jsx
          <div className="brand" onClick={onExitQuiz} style={{ cursor: "pointer" }} title="Все квизы">
            <Logo /><div><div className="brand-name">{C.brand?.name}</div><div className="brand-sub">{C.brand?.sub}</div></div>
          </div>
```

И в мобильном «More»-листе (строка ~239, перед `<div className="divider">`) добавить пункт «Все квизы»:

```jsx
            <button onClick={onExitQuiz} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderRadius: "var(--r-sm)", color: "var(--tx-2)", fontSize: 15, fontWeight: 500, textAlign: "left" }}>{I.grid({ size: 19 })}Все квизы</button>
```

- [ ] **Step 9: Бренд в мобильном топбаре и на экране Auth**

In `src/App.jsx`, в мобильном топбаре заменить `67quant`-строку? — там используется только `<Logo>` и `titleOf[screen]`, бренд-имя не зашито, менять не нужно. Проверить экран Auth: он рендерит собственный бренд (Task 12 настроит Auth под манифест). Здесь изменений нет — шаг-проверка.

Run: `npm run build`
Expected: SUCCESS — `App.jsx` компилируется.

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx
git commit -m "feat(app): quiz-aware shell — manifest brand, feature-driven nav, data-driven achievements, exit-to-catalog"
```

---

### Task 11: Экран каталога

**Files:**
- Create: `src/lib/platform.js`
- Create: `src/screens/Catalog.jsx`

- [ ] **Step 1: Бренд платформы**

Create `src/lib/platform.js`:

```js
// Бренд платформы-каталога (над отдельными квизами). Меняется в одном месте.
export const PLATFORM = {
  name: "Квизариум",
  sub: "тренажёры-квизы",
  tagline: "Выберите тренажёр и проверьте себя",
}
```

- [ ] **Step 2: Экран каталога**

Create `src/screens/Catalog.jsx`:

```jsx
/* screens/Catalog.jsx — лендинг со списком квизов. Переиспользует card/tile-оформление. */
import React, { useEffect, useState } from 'react'
import { I, Logo, Btn } from '../components/ui.jsx'
import { TVChart, anchorsToCloses, genCandles } from '../components/charts.jsx'
import { api } from '../lib/api.js'
import { PLATFORM } from '../lib/platform.js'

export default function Catalog({ onPick }) {
  const [quizzes, setQuizzes] = useState(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    api.quizzes().then((d) => setQuizzes(d.quizzes)).catch(() => setErr(true))
  }, [])

  const candles = genCandles(anchorsToCloses([[0, 80], [0.4, 110], [0.6, 96], [1, 130]], 50, 1.4, 3), { seed: 9 })

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 50% -10%, rgba(41,98,255,.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '38%', opacity: 0.25, pointerEvents: 'none' }}>
        <TVChart candles={candles} height={360} autosize />
      </div>

      <div className="wrap fade-in" style={{ maxWidth: 940, position: 'relative', zIndex: 2, padding: '48px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Logo size={34} />
          <div><div className="brand-name" style={{ fontSize: 18 }}>{PLATFORM.name}</div>
            <div className="brand-sub">{PLATFORM.sub}</div></div>
        </div>
        <h2 style={{ fontSize: 28, letterSpacing: '-.03em', margin: '18px 0 6px' }}>{PLATFORM.tagline}</h2>
        <p style={{ color: 'var(--tx-3)', marginTop: 0, marginBottom: 30, fontSize: 14 }}>Прогресс по каждому тренажёру сохраняется отдельно.</p>

        {err && <div className="card card-pad" style={{ color: 'var(--down)' }}>Не удалось загрузить список квизов. Обновите страницу.</div>}

        <div className="grid-tiles" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
          {(quizzes || []).map((q) => (
            <button key={q.id} className="tile" onClick={() => onPick(q.id)} style={{
              textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 168,
            }}>
              <div className="glow" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${q.accent}22`, display: 'grid', placeItems: 'center', color: q.accent, boxShadow: `inset 0 0 0 1px ${q.accent}55` }}>{(I[q.icon] || I.brain)({ size: 22 })}</div>
                <I.arrowR size={18} style={{ color: 'var(--tx-3)' }} />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-.01em' }}>{q.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 6, lineHeight: 1.5 }}>{q.tagline}</div>
              </div>
              <div style={{ display: 'flex', gap: 14, position: 'relative', fontSize: 12, color: 'var(--tx-3)' }}>
                <span className="mono">{q.questionCount} вопросов</span>
                <span className="mono">{q.topicCount} блока</span>
              </div>
            </button>
          ))}

          {quizzes && (
            <div className="tile" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', justifyContent: 'center', minHeight: 168, opacity: .5 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--panel-3)', display: 'grid', placeItems: 'center', color: 'var(--tx-3)' }}>{I.layers({ size: 22 })}</div>
              <div><div style={{ fontWeight: 600, fontSize: 15 }}>Скоро ещё</div>
                <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 4 }}>Новые тренажёры в разработке</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Сборка проходит**

Run: `npm run build`
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/platform.js src/screens/Catalog.jsx
git commit -m "feat: catalog landing screen listing quizzes"
```

---

### Task 12: Root-роутер + переписать `main.jsx`

**Files:**
- Create: `src/screens/Root.jsx`
- Modify: `src/main.jsx`
- Modify: `src/screens/Auth.jsx`

- [ ] **Step 1: Root — каталог ↔ квиз, загрузка контента/прогресса по входу**

Create `src/screens/Root.jsx`:

```jsx
/* screens/Root.jsx — верхнеуровневый роутер платформы.
   '/' → каталог; '/<quizId>' → загрузка контента+прогресса и рендер App.
   Навигация через history.pushState + popstate, без перезагрузки страницы. */
import React, { useEffect, useState, useCallback } from 'react'
import App from '../App.jsx'
import Catalog from './Catalog.jsx'
import { api } from '../lib/api.js'
import { initContent } from '../lib/content.js'
import { parseRoute, quizPath } from '../lib/route.js'

export default function Root({ initialMe }) {
  const [me] = useState(initialMe)                       // Telegram-сессия глобальна
  const [route, setRoute] = useState(() => parseRoute(location.pathname))
  const [loaded, setLoaded] = useState(null)             // { quizId, store } | null
  const [phase, setPhase] = useState('idle')             // idle | loading | error

  // Загружает контент квиза в синглтон C + прогресс пользователя.
  const enterQuiz = useCallback(async (quizId) => {
    setPhase('loading')
    try {
      const content = await api.content(quizId)
      initContent(content)
      let store = null
      if (me) { try { store = await api.progress(quizId) } catch { store = null } }
      setLoaded({ quizId, store })
      setPhase('idle')
    } catch {
      setPhase('error')
    }
  }, [me])

  // Реакция на изменение route (включая back/forward).
  useEffect(() => {
    if (route.view === 'quiz') {
      if (!loaded || loaded.quizId !== route.quizId) enterQuiz(route.quizId)
    } else {
      setLoaded(null)
    }
  }, [route, loaded, enterQuiz])

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goCatalog = useCallback(() => {
    history.pushState({}, '', '/')
    setRoute({ view: 'catalog', quizId: null })
  }, [])
  const goQuiz = useCallback((id) => {
    history.pushState({}, '', quizPath(id))
    setRoute({ view: 'quiz', quizId: id })
  }, [])

  if (route.view === 'catalog') return <Catalog onPick={goQuiz} />

  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', color: 'var(--tx-2)' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Не удалось загрузить квиз</div>
          <button className="btn btn-pri" onClick={goCatalog}>← Все квизы</button>
        </div>
      </div>
    )
  }

  if (!loaded || loaded.quizId !== route.quizId) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--tx-3)', fontSize: 13 }}>Загрузка…</div>
  }

  return (
    <App
      key={loaded.quizId}                     // полный сброс state при смене квиза
      quizId={loaded.quizId}
      initialUser={me?.user || null}
      initialStore={loaded.store}
      onExitQuiz={goCatalog}
    />
  )
}
```

- [ ] **Step 2: Переписать `main.jsx` под Root**

Replace entire `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './screens/Root.jsx'
import { api } from './lib/api.js'
import './styles.css'

// Telegram Login Widget привязан к одному домену (financequiz-gamma.vercel.app).
// Любой другой *.vercel.app адрес даёт "Bot domain invalid". Канонизируем хост.
const CANONICAL_HOST = 'financequiz-gamma.vercel.app'
if (
  typeof location !== 'undefined' &&
  location.hostname.endsWith('.vercel.app') &&
  location.hostname !== CANONICAL_HOST
) {
  location.replace('https://' + CANONICAL_HOST + location.pathname + location.search)
}

async function boot() {
  // Сессия Telegram глобальна — грузим один раз. Контент квиза подгрузит Root по роуту.
  const me = await api.me() // { user } или null
  ReactDOM.createRoot(document.getElementById('root')).render(<Root initialMe={me} />)
}

function fatal(message) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;' +
      'font-family:system-ui,sans-serif;color:#c9d1e0;background:#0b0d12;text-align:center;line-height:1.5">' +
      '<div><div style="font-size:16px;font-weight:600;margin-bottom:8px">Не удалось загрузить приложение</div>' +
      '<div style="font-size:13px;opacity:.7">' + message + '</div></div></div>'
  }
}

boot().catch(() => fatal('Проверьте соединение и обновите страницу.'))
```

- [ ] **Step 3: Бренд на экране Auth — из манифеста**

In `src/screens/Auth.jsx`, импортировать синглтон и заменить захардкоженный бренд. Добавить импорт (после строки 4):

```jsx
import { C } from '../lib/content.js'
```

Заменить блок бренда (строки 61–67):

```jsx
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
          <Logo size={34} />
          <div>
            <div className="brand-name" style={{ fontSize: 16 }}>{C.brand?.name}</div>
            <div className="brand-sub">{C.brand?.sub}</div>
          </div>
        </div>
```

- [ ] **Step 4: Прогнать тесты + сборку**

Run: `npm test && npm run build`
Expected: PASS (все сьюты) + SUCCESS (сборка).

- [ ] **Step 5: Ручная проверка роутинга (dev)**

Run: `npm run dev`, открыть `http://localhost:5173/`.
Expected:
- `/` → каталог с карточкой «Финансы и трейдинг».
- Клик по карточке → URL меняется на `/finance`, грузится шелл квиза (контент подтянется через `/api/content?quiz=finance` — для полноценной работы API нужен `vercel dev`; без него увидите «Загрузка…»/ошибку, что нормально).
- Кнопка браузера «назад» возвращает на каталог.

> Полная end-to-end проверка с API/БД — в Task 15.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Root.jsx src/main.jsx src/screens/Auth.jsx
git commit -m "feat: Root router (catalog <-> quiz) + manifest-branded auth"
```

---

## Phase 3 — Матстат-квиз

### Task 13: Контент квиза «матстат» + регистрация

**Files:**
- Create: `api/_data/matstat/questions.js`
- Create: `api/_data/matstat/glossary.js`
- Create: `api/_data/matstat/achievements.js`
- Create: `api/_data/matstat/manifest.js`
- Modify: `api/_data/registry.js`
- Modify: `test/registry.test.js`

- [ ] **Step 1: Вопросы и топики матстата**

Create `api/_data/matstat/questions.js`:

```js
/* matstat/questions.js — вопросы по математической статистике. Каркас-образец. */
export const TOPICS = [
  { id: "desc", name: "Описательная статистика",        short: "ОС", color: "#22c55e", accent: "#22c55e" },
  { id: "prob", name: "Вероятность и распределения",    short: "ВР", color: "#a855f7", accent: "#a855f7" },
  { id: "inf",  name: "Проверка гипотез",               short: "ПГ", color: "#f59e0b", accent: "#f59e0b" },
];

export const QUESTIONS = [
  {
    id: "ms1", topic: "desc", difficulty: 1,
    q: "Что такое медиана выборки?",
    options: [
      "Значение, делящее упорядоченный ряд пополам",
      "Среднее арифметическое всех значений",
      "Самое частое значение в выборке",
      "Разность максимума и минимума",
    ],
    correct: [0], multi: false,
    explain: "Медиана — это серединное значение упорядоченного ряда: половина наблюдений меньше неё, половина больше. В отличие от среднего, она устойчива к выбросам.",
  },
  {
    id: "ms2", topic: "desc", difficulty: 2,
    q: "Почему при сильных выбросах медиана предпочтительнее среднего?",
    options: [
      "Медиана не смещается под действием отдельных экстремальных значений",
      "Медиану всегда проще вычислить, чем среднее",
      "Среднее не определено для несимметричных распределений",
      "Медиана учитывает все значения с одинаковым весом",
    ],
    correct: [0], multi: false,
    explain: "Среднее «тянется» к выбросам, поскольку суммирует все значения. Медиана зависит лишь от порядка и положения центра, поэтому устойчива (робастна) к экстремальным наблюдениям.",
  },
  {
    id: "ms3", topic: "desc", difficulty: 2, multi: true,
    q: "Какие из величин являются мерами разброса? (несколько ответов)",
    options: ["Дисперсия", "Стандартное отклонение", "Размах (range)", "Мода", "Межквартильный размах (IQR)"],
    correct: [0, 1, 2, 4],
    explain: "Меры разброса описывают, насколько значения рассеяны: дисперсия, стандартное отклонение, размах, межквартильный размах. Мода — мера центральной тенденции, а не разброса.",
  },
  {
    id: "ms4", topic: "prob", difficulty: 1, viz: "normaldist",
    q: "Согласно правилу 68–95–99.7 для нормального распределения, какая доля значений попадает в ±1σ от среднего?",
    options: ["≈ 68%", "≈ 95%", "≈ 99.7%", "≈ 50%"],
    correct: [0], multi: false,
    explain: "Для нормального распределения примерно 68% значений лежат в пределах ±1σ, 95% — в ±2σ и 99.7% — в ±3σ. Это «правило трёх сигм».",
  },
  {
    id: "ms5", topic: "prob", difficulty: 2,
    q: "Что показывает стандартное отклонение?",
    options: [
      "Типичное отклонение значений от среднего",
      "Самое вероятное значение случайной величины",
      "Вероятность ошибки первого рода",
      "Долю объяснённой дисперсии моделью",
    ],
    correct: [0], multi: false,
    explain: "Стандартное отклонение — корень из дисперсии; оно измеряет, насколько в среднем значения отклоняются от среднего, в тех же единицах, что и сами данные.",
  },
  {
    id: "ms6", topic: "prob", difficulty: 3, viz: "clt",
    q: "Что утверждает центральная предельная теорема (ЦПТ)?",
    options: [
      "Распределение выборочного среднего стремится к нормальному с ростом n",
      "Любая выборка распределена нормально",
      "Среднее всегда равно медиане при больших n",
      "Дисперсия выборки растёт пропорционально n",
    ],
    correct: [0], multi: false,
    explain: "ЦПТ: при росте размера выборки распределение выборочного среднего приближается к нормальному почти независимо от формы исходного распределения (при конечной дисперсии). Поэтому нормальное распределение так часто возникает на практике.",
  },
  {
    id: "ms7", topic: "inf", difficulty: 2,
    q: "Что такое p-value при проверке гипотез?",
    options: [
      "Вероятность получить столь же или более экстремальные данные, если H₀ верна",
      "Вероятность того, что нулевая гипотеза верна",
      "Вероятность того, что альтернативная гипотеза верна",
      "Размер эффекта, обнаруженного в выборке",
    ],
    correct: [0], multi: false,
    explain: "p-value — вероятность наблюдать данные не менее экстремальные, чем имеющиеся, при условии истинности H₀. Это НЕ вероятность того, что H₀ верна. Малое p-value говорит о несовместимости данных с H₀.",
  },
  {
    id: "ms8", topic: "inf", difficulty: 3,
    q: "Что такое ошибка первого рода (тип I)?",
    options: [
      "Отвергнуть верную нулевую гипотезу",
      "Принять ложную нулевую гипотезу",
      "Выбрать слишком маленькую выборку",
      "Ошибиться в расчёте среднего",
    ],
    correct: [0], multi: false,
    explain: "Ошибка I рода — ложноположительный вывод: мы отвергаем H₀, хотя она верна. Её вероятность равна уровню значимости α. Ошибка II рода — не отвергнуть ложную H₀.",
  },
];
```

- [ ] **Step 2: Словарь матстата**

Create `api/_data/matstat/glossary.js`:

```js
/* matstat/glossary.js — основные термины матстата. */
export const GLOSSARY = [
  { t: "Среднее (математическое ожидание)", topic: "desc", d: "Сумма значений, делённая на их количество. Чувствительно к выбросам." },
  { t: "Медиана", topic: "desc", d: "Серединное значение упорядоченного ряда. Робастна к выбросам." },
  { t: "Мода", topic: "desc", d: "Наиболее часто встречающееся значение в выборке." },
  { t: "Дисперсия", topic: "desc", d: "Средний квадрат отклонения значений от среднего. Мера разброса." },
  { t: "Стандартное отклонение", topic: "desc", d: "Корень из дисперсии; разброс в исходных единицах данных." },
  { t: "Межквартильный размах (IQR)", topic: "desc", d: "Разность между третьим и первым квартилями (Q3 − Q1). Робастная мера разброса." },
  { t: "Нормальное распределение", topic: "prob", d: "Колоколообразное симметричное распределение; задаётся средним μ и σ. Правило 68–95–99.7." },
  { t: "Центральная предельная теорема", topic: "prob", d: "Распределение выборочного среднего стремится к нормальному с ростом размера выборки." },
  { t: "Случайная величина", topic: "prob", d: "Величина, принимающая значения с определёнными вероятностями (дискретная или непрерывная)." },
  { t: "Нулевая гипотеза (H₀)", topic: "inf", d: "Предположение об отсутствии эффекта/различия, которое проверяется по данным." },
  { t: "p-value", topic: "inf", d: "Вероятность данных не менее экстремальных, чем наблюдаемые, при истинной H₀." },
  { t: "Доверительный интервал", topic: "inf", d: "Диапазон, который с заданной вероятностью (например 95%) накрывает истинный параметр." },
];
```

- [ ] **Step 3: Ачивки матстата (без trade/finance-специфики)**

Create `api/_data/matstat/achievements.js`:

```js
/* matstat/achievements.js — ачивки матстат-квиза (правила см. src/lib/achievements.js). */
export const MATSTAT_ACHIEVEMENTS = [
  { id: "first",   name: "Первый шаг", desc: "Пройти первый квиз",        icon: "play",  color: "var(--ac)",     rule: { kind: "attempts", n: 1 } },
  { id: "streak",  name: "В ритме",    desc: "Серия 3 дня",                icon: "flame", color: "var(--down)",   rule: { kind: "streak", days: 3 } },
  { id: "perfect", name: "Без ошибок", desc: "100% в сессии 5+",           icon: "target",color: "var(--ok)",     rule: { kind: "perfectSession", size: 5 } },
  { id: "thirty",  name: "Практик",    desc: "30 ответов",                 icon: "layers",color: "var(--purple)", rule: { kind: "totalAnswered", n: 30 } },
  { id: "prob",    name: "Вероятностник", desc: "Распределения на 60%",    icon: "brain", color: "var(--ac)",     rule: { kind: "topicMastery", topic: "prob", pct: 60 } },
  { id: "scholar", name: "Эрудит",     desc: "Все блоки на 60%",           icon: "brain", color: "var(--ac)",     rule: { kind: "allTopicsMastery", pct: 60 } },
  { id: "ace",     name: "Снайпер",    desc: "Точность 90%+",              icon: "star",  color: "var(--warn)",   rule: { kind: "accuracy", n: 10, pct: 90 } },
];
```

- [ ] **Step 4: Манифест матстата (без tradetest)**

Create `api/_data/matstat/manifest.js`:

```js
import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { MATSTAT_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const matstatQuiz = {
  id: "matstat",
  title: "Математическая статистика",
  tagline: "Описательная статистика, распределения и проверка гипотез",
  brand: { name: "СтатКвиз", sub: "тренажёр по матстату" },
  accent: "#22c55e",
  icon: "brain",
  features: { glossary: true, tradetest: false },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: [],
  achievements: MATSTAT_ACHIEVEMENTS,
}
```

- [ ] **Step 5: Зарегистрировать матстат в реестре**

In `api/_data/registry.js`, добавить импорт и расширить массив:

```js
import { financeQuiz } from './finance/manifest.js'
import { matstatQuiz } from './matstat/manifest.js'

// Порядок здесь = порядок карточек в каталоге.
const QUIZZES = [financeQuiz, matstatQuiz]
```

- [ ] **Step 6: Расширить тест реестра под второй квиз**

In `test/registry.test.js`, добавить тест в `describe('quiz registry', ...)`:

```js
  it('matstat зарегистрирован, без tradetest', () => {
    const list = listQuizzes()
    expect(list.map((q) => q.id)).toContain('matstat')
    const ms = getQuiz('matstat')
    expect(ms.features.tradetest).toBe(false)
    expect(ms.questions.length).toBeGreaterThanOrEqual(5)
    expect(ms.glossary.length).toBeGreaterThanOrEqual(10)
  })
```

- [ ] **Step 7: Запустить тест реестра**

Run: `npm test -- registry`
Expected: PASS (4 теста, включая новый).

- [ ] **Step 8: Commit**

```bash
git add api/_data/matstat api/_data/registry.js test/registry.test.js
git commit -m "feat: matstat quiz content (topics, questions, glossary, achievements, manifest)"
```

---

### Task 14: Интерактивные viz матстата (`normaldist`, `clt`)

**Files:**
- Create: `src/components/viz/matstat.jsx`
- Modify: `src/components/viz/index.js`

- [ ] **Step 1: Компоненты визуализаций**

Create `src/components/viz/matstat.jsx`:

```jsx
/* viz/matstat.jsx — интерактивные визуализации для матстата. */
import React, { useMemo, useState } from 'react'
import { I } from '../ui.jsx'
import { VSlider } from './finance.jsx'

function VizFrame({ title, badge, children, controls }) {
  return (
    <div className="viz">
      <div className="viz-head">
        <span className="viz-title"><I.chart size={14} />{title}</span>
        {badge && <span className="chip" style={{ background: 'var(--glass-2)', color: 'var(--tx-3)' }}>{badge}</span>}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
        {controls && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{controls}</div>}
      </div>
    </div>
  )
}

const W = 360, H = 170, PAD = 6
const normalPdf = (x, mu, sigma) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI))

/* ---------- normaldist: нормальная кривая + правило 68-95-99.7 ---------- */
function NormalDist() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const view = { min: -6, max: 6 }
  const { path, area, peak } = useMemo(() => {
    const n = 120
    const xs = Array.from({ length: n + 1 }, (_, i) => view.min + (i / n) * (view.max - view.min))
    const ys = xs.map((x) => normalPdf(x, mu, sigma))
    const peak = Math.max(...ys, normalPdf(mu, mu, sigma))
    const sx = (x) => PAD + ((x - view.min) / (view.max - view.min)) * (W - 2 * PAD)
    const sy = (y) => H - PAD - (y / peak) * (H - 2 * PAD)
    const path = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(ys[i]).toFixed(1)}`).join(' ')
    // заливка ±1σ
    const inband = xs.filter((x) => x >= mu - sigma && x <= mu + sigma)
    const bandTop = inband.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(normalPdf(x, mu, sigma)).toFixed(1)}`).join(' ')
    const area = inband.length
      ? `${bandTop} L${sx(inband[inband.length - 1]).toFixed(1)} ${H - PAD} L${sx(inband[0]).toFixed(1)} ${H - PAD} Z`
      : ''
    return { path, area, peak }
  }, [mu, sigma])
  return (
    <VizFrame title="Нормальное распределение" badge="68–95–99.7"
      controls={<>
        <VSlider label="Среднее μ" value={mu} min={-3} max={3} step={0.1} onChange={setMu} fmt={(v) => v.toFixed(1)} accent="#22c55e" />
        <VSlider label="Отклонение σ" value={sigma} min={0.5} max={3} step={0.1} onChange={setSigma} fmt={(v) => v.toFixed(1)} accent="#22c55e" />
      </>}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {area && <path d={area} fill="rgba(34,197,94,.18)" />}
        <path d={path} fill="none" stroke="#22c55e" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
        Закрашена область ±1σ — в неё попадает ≈68% значений. Двигайте μ (сдвиг) и σ (ширина).
      </div>
    </VizFrame>
  )
}

/* ---------- clt: распределение выборочного среднего ---------- */
// Детерминированный ГПСЧ (mulberry32), чтобы перерисовка была воспроизводимой.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function CLT() {
  const [n, setN] = useState(1)
  const [seed, setSeed] = useState(1)
  // Исходное распределение — равномерное на [0,1] (заведомо НЕ нормальное).
  // Берём 600 выборок размера n, считаем средние, строим гистограмму.
  const bins = useMemo(() => {
    const rnd = mulberry32(seed * 2654435761)
    const K = 600, B = 24
    const counts = new Array(B).fill(0)
    for (let s = 0; s < K; s++) {
      let sum = 0
      for (let i = 0; i < n; i++) sum += rnd()
      const mean = sum / n
      const bi = Math.min(B - 1, Math.max(0, Math.floor(mean * B)))
      counts[bi]++
    }
    const mx = Math.max(...counts, 1)
    return counts.map((c) => c / mx)
  }, [n, seed])
  const BW = W / bins.length
  return (
    <VizFrame title="Центральная предельная теорема" badge="ЦПТ"
      controls={<>
        <VSlider label="Размер выборки n" value={n} min={1} max={30} step={1} onChange={setN} accent="#a855f7" />
        <button className="btn btn-sec" style={{ height: 32, fontSize: 12.5 }} onClick={() => setSeed((s) => s + 1)}>
          <I.repeat size={14} /> Пересэмплировать
        </button>
      </>}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {bins.map((v, i) => (
          <rect key={i} x={i * BW + 1} y={H - v * (H - 8)} width={BW - 2} height={v * (H - 8)}
            fill="#a855f7" opacity="0.85" rx="1.5" />
        ))}
      </svg>
      <div style={{ fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5 }}>
        Исходные данные равномерны (плоские). При n=1 гистограмма средних плоская, но с ростом n
        распределение средних стягивается к нормальному «колоколу».
      </div>
    </VizFrame>
  )
}

export const VIZ_MATSTAT = {
  normaldist: NormalDist,
  clt: CLT,
}
```

> Reuse: `VSlider` экспортируется из `src/components/viz/finance.jsx` (см. строку 7 там). Класс `.viz`/`.viz-head`/`.viz-title` уже определён в `styles.css` (используется финансовыми viz) — нового CSS не требуется.

- [ ] **Step 2: Подмешать матстат-viz в общий реестр**

Replace entire `src/components/viz/index.js`:

```js
import { VIZ_FINANCE } from './finance.jsx'
import { VIZ_CHART } from './chart.jsx'
import { VIZ_MATSTAT } from './matstat.jsx'

export const VIZ = { ...VIZ_FINANCE, ...VIZ_CHART, ...VIZ_MATSTAT }
```

- [ ] **Step 3: Сборка проходит**

Run: `npm run build`
Expected: SUCCESS — `matstat.jsx` компилируется, `VSlider` импорт резолвится.

- [ ] **Step 4: Ручная проверка viz (dev)**

Run: `npm run dev`, открыть `/matstat` (или временно проверить через любой квиз, где viz рендерится в «Изучении»).
Expected: на вопросах `ms4`/`ms6` в разборе/в «Изучении» виден интерактивный график; слайдеры μ/σ и n меняют картинку; «Пересэмплировать» перерисовывает гистограмму.

> Если без `vercel dev` контент не грузится — отложить визуальную проверку до Task 15 (e2e на `vercel dev`).

- [ ] **Step 5: Commit**

```bash
git add src/components/viz/matstat.jsx src/components/viz/index.js
git commit -m "feat(viz): interactive matstat visualizations (normaldist, clt)"
```

---

### Task 15: End-to-end проверка и обновление README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Прогнать весь тест-сьют**

Run: `npm test`
Expected: PASS — все сьюты зелёные: `auth`, `telegram`, `quiz`, `progress`, `registry`, `score`, `route`, `achievements`.

- [ ] **Step 2: Продакшен-сборка**

Run: `npm run build`
Expected: SUCCESS, без ошибок и предупреждений о неразрешённых импортах.

- [ ] **Step 3: E2E через `vercel dev` (API + БД)**

Run: `vercel dev` (нужен заполненный `.env` с `DATABASE_URL`, см. README). Предварительно применить namespacing-миграцию: `npm run migrate`.

Ручной чек-лист (Expected):
1. `/` → каталог с двумя карточками: «Финансы и трейдинг» и «Математическая статистика».
2. Открыть «Математическая статистика» → URL `/matstat`, бренд в сайдбаре «СтатКвиз», акцент зелёный, в навигации НЕТ «Трейд-тест» (есть «Словарь»).
3. Пройти быстрый квиз в матстате → результат сохраняется; на вопросах `ms4`/`ms6` в разборе виден интерактивный график.
4. Вернуться «← Все квизы» (бренд в сайдбаре / пункт в мобильном «Ещё») → каталог.
5. Открыть «Финансы» → `/finance`, прежний прогресс на месте (мигрированные данные `quiz_id='finance'`), «Трейд-тест» присутствует.
6. Прогресс матстата и финансов независимы (разные серии/история/освоение).
7. `GET /api/progress?quiz=matstat` без cookie → 401.

- [ ] **Step 4: Обновить README под мульти-квиз**

In `README.md`, заменить первые две секции (заголовок + «Архитектура», строки 1–16) на:

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: multi-quiz platform architecture + how to add a quiz"
```

---

## Self-Review

**Покрытие спецификации:**
- Мульти-квиз инфраструктура → Tasks 1–12 (реестр, namespacing БД, API, каталог, роутер, data-driven бренд/навигация/ачивки). ✅
- Каталог-лендинг + URL-роуты → Tasks 7, 11, 12. ✅
- Матстат-квиз (каркас + ~7 вопросов + ~12 терминов) → Task 13. ✅
- 2 интерактивные viz матстата → Task 14. ✅
- Переиспользование текущего фронтенда (UI-кит, движок квиза, экраны, charts, Telegram-auth) → подтверждено: `Quiz.jsx`/`LearnStats.jsx`/`Extra.jsx`/`Dashboard.jsx`/`ui.jsx` не требуют изменений, читают `C.*` и `VIZ` как раньше. ✅

**Согласованность типов/имён (проверено сквозь задачи):**
- `scoreAttempt(quiz, qids, answers) → {score, spark, results:[{id,ok}]}` — определена в Task 3, потреблена в Task 5 (attempts.js). ✅
- `getQuiz(id)`/`listQuizzes()`/`DEFAULT_QUIZ` — Task 2, потреблены в Tasks 5. ✅
- Манифест-поля `{id,title,tagline,brand,accent,icon,features,topics,questions,modes,glossary,tradetest,achievements}` — единая форма в finance (Task 2) и matstat (Task 13); читаются в `/api/content` (Task 5) и каталоге (Task 11). ✅
- Контент-синглтон `C.{quizId,brand,accent,features,achievements}` — Task 8, потреблён в App (Task 10), Auth (Task 12), Catalog использует `/api/quizzes` (не `C`). ✅
- `buildMetrics`/`buildAchievements` — Task 9, потреблены в App (Task 10, шаг 5). ✅
- `parseRoute`/`quizPath` — Task 7, потреблены в Root (Task 12). ✅
- API-клиент `content(quiz)`/`progress(quiz)`/`saveAttempt(quiz, …)`/`saveTradeResult(quiz, …)` — Task 6, потреблены в Root (Task 12) и App (Task 10). ✅
- `VSlider` (экспорт `finance.jsx`) и реестр `VIZ` — Task 14. ✅
- DB namespacing `quiz_id` во всех таблицах — Task 4, согласовано с запросами в Tasks 5. ✅

**Заметки по рискам:**
- `useTweaks` (см. `tweaks.jsx`) — это edit-mode-скаффолд: значения хранятся в `useState(defaults)` и в рантайме не читаются из localStorage. Поэтому per-quiz акцент задаётся через `tweakDefaults = {...TWEAK_DEFAULTS, accent: C.accent}` (Task 10, шаг 3) — корректно: при входе в квиз дефолт берётся из манифеста.
- `paletteFor(hex)` заменяет фиксированную карту `ACCENTS`, чтобы зелёный акцент матстата (`#22c55e`) корректно давал `--ac-hi/--ac-dim/--ac-line` (Task 10, шаг 2).
- Миграция БД идемпотентна (`add column if not exists` + `drop constraint if exists` + `add primary key`); существующие финансовые строки получают `quiz_id='finance'` по умолчанию (Task 4).
```
