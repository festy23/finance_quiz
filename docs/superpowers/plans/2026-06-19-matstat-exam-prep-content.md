# Matstat Exam-Prep Content & Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить квиз «Математическая статистика» в полноценный тренажёр для подготовки к контрольной: LaTeX-рендеринг формул, статичные matplotlib-графики (предрендер в SVG), и полный банк контента по всем темам курса в четырёх форматах — квиз-вопросы, флеш-карточки, шпаргалка формул, интерактивные viz.

**Architecture:** На фронтенде добавляем (1) рендер математики через KaTeX (чистый парсер `$…$`/`$$…$$` + React-компоненты), (2) компонент `<Figure>` для статичных SVG, сгенерированных python-скриптами (`scripts/figures/`) и закоммиченных в `public/figures/matstat/`. Контент-модуль матстата (`api/_data/matstat/`) расширяется массивами `FLASHCARDS` и `FORMULAS`; манифест получает фичи `flashcards`/`formulas`, которые включают два новых экрана (режим карточек + шпаргалка) через уже существующую систему фиче-гейтинга навигации. Прогресс по карточкам хранится в localStorage (без изменений БД). Контент по 10 темам пишется по единому grounded-рецепту, опираясь на разобранные материалы курса.

**Tech Stack:** React 18 + Vite, KaTeX (рендер формул), Python 3 + matplotlib + numpy/scipy (генерация SVG-графиков офлайн), Vitest (node env — чистые функции + валидация контента, включая `katex.renderToString` без DOM).

---

## Контекст: что уже есть в платформе

- Квиз — это самодостаточный контент-модуль `api/_data/matstat/{questions,glossary,achievements,manifest}.js`, зарегистрированный в `api/_data/registry.js`. Сейчас у матстата 3 темы (`desc/prob/inf`) и 8 вопросов-заглушек — **этот план их заменяет/расширяет**.
- `/api/content?quiz=matstat` отдаёт `{quizId, brand, accent, features, topics, questions, modes, glossary, tradetest, achievements}`. Поля в синглтон кладёт `initContent` (`src/lib/content.js`) → экраны читают `C.*` синхронно.
- Навигация в `src/App.jsx` фиче-гейтится через `C.features` (уже так работают `glossary`/`tradetest`). Добавление `features.flashcards`/`features.formulas` включит новые пункты меню по тому же паттерну.
- Вопрос сейчас: `{ id, topic, difficulty(1-3), q, options:[...], correct:[idx], multi, explain, viz? }`. Экраны `src/screens/Quiz.jsx` (раннер + результат) и `src/screens/LearnStats.jsx` (LearnScreen/GlossaryScreen) рендерят `q.q`/`options`/`explain` как **обычные строки**. Интерактивные viz — React-компоненты в реестре `src/components/viz/index.js` (`VIZ[q.viz]`), у матстата уже есть `normaldist`/`clt` в `src/components/viz/matstat.jsx`.
- Тесты: Vitest, `environment: 'node'` (`vite.config.js`), `include: ['test/**/*.test.js']` — тестируем только чистые функции и данные (DOM нет). `katex.renderToString` работает в node — поэтому валидацию формул можно гонять в тестах.

## File Structure

**Инфраструктура рендеринга (новое):**
- `src/lib/mathtext.js` — *создать*. Чистый `splitMath(text)` → сегменты `text|inline|block`. Тестируется.
- `src/components/Tex.jsx` — *создать*. `<RichText text/>` (инлайн-микс текста и `$…$`) и `<TexBlock tex/>` (display-формула) поверх `katex.renderToString`.
- `src/components/Figure.jsx` — *создать*. `<Figure name caption/>` → `<img src="/figures/matstat/<name>.svg">` с подписью, тёмной рамкой как у `.viz`.
- `src/main.jsx` — *модифицировать*. Импорт `katex/dist/katex.min.css`.
- `package.json` — *модифицировать*. Зависимость `katex`.

**Пайплайн графиков (новое):**
- `scripts/figures/_style.py` — *создать*. Общий тёмный стиль matplotlib (фон/цвета под тему приложения) + хелпер `save(fig, name)`.
- `scripts/figures/requirements.txt` — *создать*. `numpy scipy matplotlib`.
- `scripts/figures/build.py` — *создать*. Импортирует и запускает все `fig_*.py`, печатает список созданных SVG.
- `scripts/figures/fig_<topic>.py` — *создать* (по теме). Рендерят SVG в `public/figures/matstat/`.
- `public/figures/matstat/*.svg` — *создать* (сгенерированные, коммитятся).

**Контент-модуль матстата (расширение):**
- `api/_data/matstat/questions.js` — *модифицировать*. Новая таксономия `TOPICS` (10 тем) + полный банк `QUESTIONS` (LaTeX в полях, `figure` где нужно).
- `api/_data/matstat/flashcards.js` — *создать*. `FLASHCARDS` (flip-карточки).
- `api/_data/matstat/formulas.js` — *создать*. `FORMULAS` (шпаргалка).
- `api/_data/matstat/glossary.js` — *модифицировать*. Дополнить терминами под новые темы.
- `api/_data/matstat/achievements.js` — *модифицировать*. Ачивки под новые темы/форматы.
- `api/_data/matstat/manifest.js` — *модифицировать*. `features.{flashcards,formulas}`, подключить flashcards/formulas.

**API/синглтон (расширение):**
- `api/content.js` — *модифицировать*. Возвращать `flashcards`/`formulas` (фиче-гейт).
- `src/lib/content.js` — *модифицировать*. Хранить `C.flashcards`/`C.formulas`.
- `src/lib/api.js` — без изменений (контент уже грузится целиком).

**Новые экраны/режимы:**
- `src/screens/Flashcards.jsx` — *создать*. Режим флеш-карточек (flip + самооценка, localStorage).
- `src/screens/Formulas.jsx` — *создать*. Шпаргалка формул (поиск + фильтр + графики).
- `src/lib/srs.js` — *создать*. Чистая логика самооценки/раскладки карточек (localStorage-key helpers). Тестируется.
- `src/App.jsx` — *модифицировать*. Навигация по `features.flashcards/formulas`, роутинг экранов.
- `src/components/viz/matstat.jsx` — *модифицировать*. Новые интерактивные viz (мощность критерия, ДИ, и т.п.).

**Тесты (новые):**
- `test/mathtext.test.js`, `test/srs.test.js`, `test/matstat-content.test.js` (валидация банка: LaTeX рендерится, ключи ответов валидны, все `figure` существуют, счётчики по темам).

---

## Таксономия тем (новая `TOPICS` матстата)

Десять тем (id → short, цвет). Заменяют старые `desc/prob/inf`.

| id | Тема | short | color |
|---|---|---|---|
| `desc` | Описательная статистика и ЭФР | ОС | `#22c55e` |
| `order` | Порядковые статистики | ПС | `#10b981` |
| `est` | Точечное оценивание (ММ, ММП) | ОЦ | `#a855f7` |
| `props` | Свойства оценок (несмещ./сост./эфф., Фишер, Рао–Крамер) | СВ | `#8b5cf6` |
| `ci` | Доверительные интервалы | ДИ | `#f59e0b` |
| `ht` | Проверка гипотез (Нейман–Пирсон, мощность) | ПГ | `#ef4444` |
| `chi2` | Критерии χ² (согласие, независимость, однородность) | χ² | `#f97316` |
| `reg` | Линейная регрессия | РГ | `#3b82f6` |
| `sp` | Случайные процессы | СП | `#06b6d4` |
| `py` | Python-вычисления | Py | `#eab308` |

---

# PHASE A — Инфраструктура

### Task A1: KaTeX-рендеринг математики

**Files:**
- Modify: `package.json`
- Create: `src/lib/mathtext.js`
- Test: `test/mathtext.test.js`
- Create: `src/components/Tex.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Установить KaTeX**

Run:
```bash
npm install katex@^0.16.11
```
Expected: `katex` появляется в `dependencies` в `package.json`.

- [ ] **Step 2: Написать падающий тест парсера**

Create `test/mathtext.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { splitMath } from '../src/lib/mathtext.js'

describe('splitMath', () => {
  it('обычный текст — один сегмент', () => {
    expect(splitMath('просто текст')).toEqual([{ type: 'text', value: 'просто текст' }])
  })
  it('инлайн-формула между текстом', () => {
    expect(splitMath('среднее $\\bar X$ растёт')).toEqual([
      { type: 'text', value: 'среднее ' },
      { type: 'inline', value: '\\bar X' },
      { type: 'text', value: ' растёт' },
    ])
  })
  it('блочная формула $$…$$', () => {
    expect(splitMath('итог: $$E=mc^2$$')).toEqual([
      { type: 'text', value: 'итог: ' },
      { type: 'block', value: 'E=mc^2' },
    ])
  })
  it('несколько инлайнов', () => {
    const segs = splitMath('$a$ и $b$')
    expect(segs.map((s) => s.type)).toEqual(['inline', 'text', 'inline'])
  })
  it('пустой/undefined вход', () => {
    expect(splitMath('')).toEqual([])
    expect(splitMath(undefined)).toEqual([])
  })
})
```

- [ ] **Step 3: Запустить — убедиться, что падает**

Run: `npm test -- mathtext`
Expected: FAIL — модуль не найден.

- [ ] **Step 4: Реализовать парсер**

Create `src/lib/mathtext.js`:

```js
// Разбивает строку на сегменты текста и формул. $$…$$ — блочная, $…$ — инлайн.
// Экранированный \$ остаётся литералом доллара. Чистая функция — тестируется в node.
export function splitMath(input) {
  const text = input == null ? '' : String(input)
  if (!text) return []
  const out = []
  let buf = ''
  let i = 0
  const pushText = () => { if (buf) { out.push({ type: 'text', value: buf }); buf = '' } }
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\' && text[i + 1] === '$') { buf += '$'; i += 2; continue }
    if (ch === '$') {
      const block = text[i + 1] === '$'
      const open = block ? '$$' : '$'
      const close = text.indexOf(open, i + open.length)
      if (close === -1) { buf += ch; i += 1; continue } // незакрытый — литерал
      pushText()
      out.push({ type: block ? 'block' : 'inline', value: text.slice(i + open.length, close) })
      i = close + open.length
      continue
    }
    buf += ch; i += 1
  }
  pushText()
  return out
}
```

- [ ] **Step 5: Запустить — убедиться, что проходит**

Run: `npm test -- mathtext`
Expected: PASS (5 тестов).

- [ ] **Step 6: React-компоненты рендеринга**

Create `src/components/Tex.jsx`:

```jsx
import React, { useMemo } from 'react'
import katex from 'katex'
import { splitMath } from '../lib/mathtext.js'

function render(value, displayMode) {
  try {
    return katex.renderToString(value, { displayMode, throwOnError: false, output: 'html' })
  } catch {
    return value
  }
}

// Инлайн-микс текста и формул: "среднее $\bar X$" → текст + KaTeX.
export function RichText({ text, style }) {
  const segs = useMemo(() => splitMath(text), [text])
  return (
    <span style={style}>
      {segs.map((s, i) =>
        s.type === 'text'
          ? <span key={i}>{s.value}</span>
          : <span key={i} style={s.type === 'block' ? { display: 'block', margin: '8px 0', overflowX: 'auto' } : null}
                  dangerouslySetInnerHTML={{ __html: render(s.value, s.type === 'block') }} />
      )}
    </span>
  )
}

// Отдельная display-формула (для шпаргалки/карточек).
export function TexBlock({ tex }) {
  const html = useMemo(() => render(tex, true), [tex])
  return <div style={{ overflowX: 'auto', padding: '2px 0' }} dangerouslySetInnerHTML={{ __html: html }} />
}
```

- [ ] **Step 7: Подключить CSS KaTeX**

In `src/main.jsx`, добавить импорт стилей после `import './styles.css'`:

```js
import 'katex/dist/katex.min.css'
```

- [ ] **Step 8: Сборка проходит**

Run: `npm run build`
Expected: SUCCESS (KaTeX CSS и компоненты резолвятся).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/lib/mathtext.js test/mathtext.test.js src/components/Tex.jsx src/main.jsx
git commit -m "feat(math): KaTeX rendering — splitMath parser + RichText/TexBlock"
```

---

### Task A2: Пайплайн графиков (python+matplotlib → статичный SVG) + компонент Figure

**Files:**
- Create: `scripts/figures/_style.py`
- Create: `scripts/figures/requirements.txt`
- Create: `scripts/figures/build.py`
- Create: `scripts/figures/fig_demo.py`
- Create: `src/components/Figure.jsx`

- [ ] **Step 1: Зависимости питон-пайплайна**

Create `scripts/figures/requirements.txt`:

```
numpy>=1.26
scipy>=1.11
matplotlib>=3.8
```

- [ ] **Step 2: Общий тёмный стиль + хелпер сохранения**

Create `scripts/figures/_style.py`:

```python
"""Единый тёмный стиль графиков под тему приложения. Все fig_*.py импортируют save()."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "figures", "matstat")

BG = "#0b0d12"
PANEL = "#13151b"
TX = "#c9d1e0"
TX3 = "#7a8499"
ACCENT = "#22c55e"
GRID = "#262a33"

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor": PANEL,
    "savefig.facecolor": BG,
    "text.color": TX,
    "axes.labelcolor": TX,
    "axes.edgecolor": GRID,
    "xtick.color": TX3,
    "ytick.color": TX3,
    "grid.color": GRID,
    "axes.grid": True,
    "grid.alpha": 0.5,
    "font.size": 11,
    "axes.titlesize": 12,
    "figure.dpi": 110,
    "svg.fonttype": "path",  # текст как кривые — рендер одинаков без шрифтов
})

def save(fig, name):
    """Сохранить fig в public/figures/matstat/<name>.svg."""
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name + ".svg")
    fig.tight_layout()
    fig.savefig(path, format="svg", bbox_inches="tight")
    plt.close(fig)
    print("wrote", os.path.relpath(path))
    return path
```

- [ ] **Step 3: Демо-фигура (проверка пайплайна)**

Create `scripts/figures/fig_demo.py`:

```python
"""Демо-фигура: плотность нормального распределения. Проверяет, что пайплайн работает."""
import numpy as np
from scipy import stats
from _style import save, ACCENT
import matplotlib.pyplot as plt

def build():
    x = np.linspace(-4, 4, 400)
    fig, ax = plt.subplots(figsize=(5.2, 2.8))
    ax.plot(x, stats.norm.pdf(x), color=ACCENT, lw=2)
    ax.fill_between(x, stats.norm.pdf(x), where=(np.abs(x) <= 1), color=ACCENT, alpha=0.18)
    ax.set_title("Нормальная плотность, ±1σ")
    ax.set_xlabel("x"); ax.set_ylabel("f(x)")
    save(fig, "demo_normal")

if __name__ == "__main__":
    build()
```

- [ ] **Step 4: Раннер всех фигур**

Create `scripts/figures/build.py`:

```python
"""Запускает все fig_*.py в этой папке (каждый со своим build())."""
import importlib, os, sys, glob

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)

def main():
    mods = sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, "fig_*.py")))
    n = 0
    for m in mods:
        mod = importlib.import_module(m)
        if hasattr(mod, "build"):
            mod.build(); n += 1
        else:
            print("skip (no build()):", m)
    print(f"done: {n} modules")

if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Сгенерировать демо-фигуру**

Run:
```bash
cd scripts/figures && python3 -m venv .venv && . .venv/bin/activate && pip install -q -r requirements.txt && python build.py && deactivate
```
Expected: печатает `wrote ../../public/figures/matstat/demo_normal.svg` и `done: 1 modules`; файл `public/figures/matstat/demo_normal.svg` существует.

> Если `python3`/venv недоступны в среде исполнения — выполнить шаг вручную там, где есть Python; SVG коммитятся в репозиторий, поэтому повторный рендер при деплое не нужен.

- [ ] **Step 6: Компонент Figure**

Create `src/components/Figure.jsx`:

```jsx
import React from 'react'
import { I } from './ui.jsx'

// Статичный предрендеренный SVG-график. name → /figures/matstat/<name>.svg
export function Figure({ name, caption }) {
  return (
    <div className="viz" style={{ background: 'var(--bg-1)' }}>
      <div className="viz-head">
        <span className="viz-title"><I.chart size={14} />{caption || 'График'}</span>
        <span className="chip" style={{ background: 'var(--glass-2)', color: 'var(--tx-3)' }}>matplotlib</span>
      </div>
      <div style={{ padding: 10, display: 'flex', justifyContent: 'center' }}>
        <img src={`/figures/matstat/${name}.svg`} alt={caption || name}
             style={{ maxWidth: '100%', height: 'auto', display: 'block' }} loading="lazy" />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Сборка + коммит**

Run: `npm run build`
Expected: SUCCESS.

```bash
git add scripts/figures public/figures/matstat src/components/Figure.jsx
git commit -m "feat(figures): python+matplotlib SVG pipeline + Figure component"
```

---

### Task A3: Контент-схема — flashcards/formulas в API и синглтоне + рендер LaTeX/Figure в квизе

**Files:**
- Create: `api/_data/matstat/flashcards.js` (заглушка-массив, наполняется в Phase B)
- Create: `api/_data/matstat/formulas.js` (заглушка-массив)
- Modify: `api/_data/matstat/manifest.js`
- Modify: `api/content.js`
- Modify: `src/lib/content.js`
- Modify: `src/screens/Quiz.jsx`
- Modify: `src/screens/LearnStats.jsx`

- [ ] **Step 1: Пустые контент-массивы (наполняются в Phase B)**

Create `api/_data/matstat/flashcards.js`:

```js
/* matstat/flashcards.js — flip-карточки (front/back могут содержать LaTeX $…$). */
export const FLASHCARDS = []
```

Create `api/_data/matstat/formulas.js`:

```js
/* matstat/formulas.js — шпаргалка формул (latex — display-формула). */
export const FORMULAS = []
```

- [ ] **Step 2: Подключить в манифест + фичи**

In `api/_data/matstat/manifest.js`, заменить импорты и объект так, чтобы добавить flashcards/formulas и фичи. Новая версия файла:

```js
import { QUESTIONS, TOPICS } from './questions.js'
import { GLOSSARY } from './glossary.js'
import { FLASHCARDS } from './flashcards.js'
import { FORMULAS } from './formulas.js'
import { MATSTAT_ACHIEVEMENTS } from './achievements.js'
import { DEFAULT_MODES } from '../modes.js'

export const matstatQuiz = {
  id: "matstat",
  title: "Математическая статистика",
  tagline: "Оценивание, доверительные интервалы, гипотезы, регрессия, случайные процессы",
  brand: { name: "СтатКвиз", sub: "подготовка к контрольной" },
  accent: "#22c55e",
  icon: "brain",
  features: { glossary: true, tradetest: false, flashcards: true, formulas: true },
  topics: TOPICS,
  questions: QUESTIONS,
  modes: DEFAULT_MODES,
  glossary: GLOSSARY,
  tradetest: [],
  flashcards: FLASHCARDS,
  formulas: FORMULAS,
  achievements: MATSTAT_ACHIEVEMENTS,
}
```

- [ ] **Step 3: Отдавать flashcards/formulas из API (фиче-гейт)**

In `api/content.js`, в объекте ответа `res.json({...})` добавить два поля (после `tradetest`):

```js
    flashcards: q.features.flashcards ? (q.flashcards || []) : [],
    formulas: q.features.formulas ? (q.formulas || []) : [],
```

- [ ] **Step 4: Хранить в синглтоне**

In `src/lib/content.js`, расширить `C` и `initContent`. Добавить в объект `C` поля `flashcards: [], formulas: []`, и в `initContent` две строки:

```js
  C.flashcards = data.flashcards || []
  C.formulas = data.formulas || []
```

- [ ] **Step 5: Рендерить LaTeX + Figure в раннере квиза**

In `src/screens/Quiz.jsx`:

Добавить импорты (после строки `import { VIZ } from '../components/viz/index.js'`):
```jsx
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
```

Заменить рендер заголовка вопроса (строка с `<h2 ...>{q.q}</h2>`):
```jsx
          <h2 style={{ fontSize: 21, lineHeight: 1.35, letterSpacing: "-.01em", margin: "0 0 22px", textWrap: "pretty" }}><RichText text={q.q} /></h2>
```

Заменить рендер текста варианта (`<span className="opt-txt">{opt}</span>` в РАННЕРЕ, не в ReviewItem) на:
```jsx
                  <span className="opt-txt"><RichText text={opt} /></span>
```

Заменить тело разбора (`{q.explain}` внутри блока reveal) на:
```jsx
                <RichText text={q.explain} />
```

И в reveal-блоке после `{VizComp && <VizComp />}` добавить статичную фигуру (если задана):
```jsx
              {q.figure && <Figure name={q.figure} caption={q.figureCaption} />}
```

В `ReviewItem` (там же) сделать те же замены: `<span className="opt-txt" ...>{opt}</span>` → `<span className="opt-txt" style={{ fontSize: 13.5 }}><RichText text={opt} /></span>`, блок `<div className="explain">{q.explain}</div>` → `<div className="explain"><RichText text={q.explain} /></div>`, и после `{VizComp && <VizComp />}` добавить `{q.figure && <Figure name={q.figure} caption={q.figureCaption} />}`.

- [ ] **Step 6: Рендерить LaTeX + Figure в «Изучении»**

In `src/screens/LearnStats.jsx`, в `LearnScreen`:

Добавить импорты:
```jsx
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
```

В карточке заменить `<h3 ...>{q.q}</h3>` на `<h3 ...><RichText text={q.q} /></h3>`, `<div className="explain">{q.explain}</div>` на `<div className="explain"><RichText text={q.explain} /></div>`, и после `{V && <div ...><V /></div>}` добавить:
```jsx
              {q.figure && <div style={{ marginBottom: 14 }}><Figure name={q.figure} caption={q.figureCaption} /></div>}
```

- [ ] **Step 7: Тест + сборка**

Run: `npm test && npm run build`
Expected: PASS (существующие тесты не сломаны) + SUCCESS.

- [ ] **Step 8: Commit**

```bash
git add api/_data/matstat/flashcards.js api/_data/matstat/formulas.js api/_data/matstat/manifest.js api/content.js src/lib/content.js src/screens/Quiz.jsx src/screens/LearnStats.jsx
git commit -m "feat(content): flashcards/formulas channels + LaTeX & Figure rendering in quiz/learn"
```

---

### Task A4: Режим флеш-карточек (flip + самооценка в localStorage)

**Files:**
- Create: `src/lib/srs.js`
- Test: `test/srs.test.js`
- Create: `src/screens/Flashcards.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Падающий тест логики раскладки карточек**

Create `test/srs.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { nextOrder, mergeRatings, dueCount } from '../src/lib/srs.js'

describe('srs (flashcards)', () => {
  it('mergeRatings перезаписывает оценку карточки', () => {
    expect(mergeRatings({ a: 'know' }, 'b', 'again')).toEqual({ a: 'know', b: 'again' })
    expect(mergeRatings({ a: 'know' }, 'a', 'again')).toEqual({ a: 'again' })
  })
  it('dueCount = карточки без оценки know', () => {
    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(dueCount(cards, { a: 'know', b: 'again' })).toBe(2) // b(again) + c(нет оценки)
  })
  it('nextOrder ставит «again» и новые вперёд, «know» — в конец', () => {
    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const order = nextOrder(cards, { a: 'know', b: 'again' }).map((c) => c.id)
    expect(order[order.length - 1]).toBe('a')      // know — в конец
    expect(order.slice(0, 2).sort()).toEqual(['b', 'c']) // again + new — вперёд
  })
})
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- srs`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать**

Create `src/lib/srs.js`:

```js
// Лёгкая «самооценка» флеш-карточек. Оценка карточки: 'know' | 'again'.
// Без интервалов/дат — просто упорядочивание: повторить и новые вперёд, выученные в конец.

export function mergeRatings(ratings, id, rating) {
  return { ...ratings, [id]: rating }
}

export function dueCount(cards, ratings) {
  return cards.filter((c) => ratings[c.id] !== 'know').length
}

export function nextOrder(cards, ratings) {
  const weight = (c) => (ratings[c.id] === 'know' ? 2 : ratings[c.id] === 'again' ? 0 : 1)
  return [...cards].sort((a, b) => weight(a) - weight(b))
}

// localStorage helpers (ключ на квиз). Безопасны в node/SSR (guard на window).
export function loadRatings(quizId) {
  try { return JSON.parse(localStorage.getItem('fc_' + quizId) || '{}') } catch { return {} }
}
export function saveRatings(quizId, ratings) {
  try { localStorage.setItem('fc_' + quizId, JSON.stringify(ratings)) } catch { /* ignore */ }
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm test -- srs`
Expected: PASS (3 теста).

- [ ] **Step 5: Экран флеш-карточек**

Create `src/screens/Flashcards.jsx`:

```jsx
/* screens/Flashcards.jsx — режим зубрёжки: flip-карточка + самооценка (localStorage). */
import React, { useState, useMemo } from 'react'
import { I, Btn, Pbar, TopicChip } from '../components/ui.jsx'
import { RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { QData } from '../lib/quiz.js'
import { nextOrder, mergeRatings, dueCount, loadRatings, saveRatings } from '../lib/srs.js'
import { Empty } from './LearnStats.jsx'

export function FlashcardsScreen({ ctx }) {
  const [topic, setTopic] = useState(null)
  const [ratings, setRatings] = useState(() => loadRatings('matstat'))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const pool = useMemo(() => C.flashcards.filter((c) => !topic || c.topic === topic), [topic])
  const deck = useMemo(() => nextOrder(pool, ratings), [pool, ratings])
  const card = deck[idx]
  const due = dueCount(pool, ratings)

  const rate = (r) => {
    const next = mergeRatings(ratings, card.id, r)
    setRatings(next); saveRatings('matstat', next)
    setFlipped(false); setIdx((i) => (i + 1 < deck.length ? i + 1 : 0))
  }

  if (!C.flashcards.length) return <div className="wrap"><Empty text="Карточки появятся скоро" /></div>

  return (
    <div className="wrap fade-in" style={{ maxWidth: 720 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.02em", margin: "0 0 4px" }}>Карточки</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 18, fontSize: 14 }}>Зубрёжка формул и определений. Осталось повторить: <b className="mono">{due}</b></p>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={!topic ? "on" : ""} onClick={() => { setTopic(null); setIdx(0); setFlipped(false) }}>Все</button>
        {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => { setTopic(t.id); setIdx(0); setFlipped(false) }}>{t.short}</button>)}
      </div>

      {!card ? <Empty text="В этой теме карточек нет" /> : (
        <>
          <div style={{ marginBottom: 10 }}><Pbar val={(idx / Math.max(1, deck.length)) * 100} color="var(--ac)" /></div>
          <button onClick={() => setFlipped((f) => !f)} className="card card-pad" style={{ width: "100%", minHeight: 240, display: "flex", flexDirection: "column", gap: 14, textAlign: "left", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <TopicChip topic={card.topic} small />
              <span className="chip" style={{ background: "var(--panel-2)", color: "var(--tx-3)" }}>{flipped ? "ответ" : "вопрос"}</span>
            </div>
            <div style={{ flex: 1, display: "grid", placeItems: "center", fontSize: 17, lineHeight: 1.5, padding: "10px 4px" }}>
              <div><RichText text={flipped ? card.back : card.front} /></div>
            </div>
            {flipped && card.figure && <Figure name={card.figure} caption={card.figureCaption} />}
            {!flipped && <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--tx-3)" }}>нажмите, чтобы перевернуть</div>}
          </button>

          {flipped && (
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <Btn variant="sec" block lg icon={<I.repeat size={16} />} onClick={() => rate('again')}>Повторить</Btn>
              <Btn variant="pri" block lg icon={<I.check size={16} />} onClick={() => rate('know')}>Знаю</Btn>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Подключить экран в App (роутинг + навигация)**

In `src/App.jsx`:

Импорт (рядом с прочими screens):
```jsx
import { FlashcardsScreen } from './screens/Flashcards.jsx'
```

В `NAVMAP` добавить запись:
```jsx
    flashcards: { label: "Карточки", icon: "layers" },
```

В `GROUPS`, в группу «Материалы», добавить фиче-гейт `flashcards` (рядом с learn/glossary):
```jsx
    { label: "Материалы", items: ["learn", ...(feat.flashcards ? ["flashcards"] : []), ...(feat.glossary ? ["glossary"] : [])] },
```

В `MOBILE_MORE` добавить `...(feat.flashcards ? ["flashcards"] : [])` перед `...(feat.glossary ? ["glossary"] : [])`.

В `renderScreen()` добавить ветку:
```jsx
      case "flashcards": return <FlashcardsScreen ctx={ctx} />;
```

И в `titleOf` запись подхватится автоматически из `NAVMAP` (там уже есть `flashcards`).

- [ ] **Step 7: Сборка + тест**

Run: `npm test && npm run build`
Expected: PASS + SUCCESS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/srs.js test/srs.test.js src/screens/Flashcards.jsx src/App.jsx
git commit -m "feat(flashcards): flip-card study mode with localStorage self-rating"
```

---

### Task A5: Экран «Шпаргалка формул»

**Files:**
- Create: `src/screens/Formulas.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Экран шпаргалки**

Create `src/screens/Formulas.jsx`:

```jsx
/* screens/Formulas.jsx — справочник формул: поиск + фильтр по темам + display-формулы. */
import React, { useState, useMemo } from 'react'
import { I, TopicChip } from '../components/ui.jsx'
import { TexBlock, RichText } from '../components/Tex.jsx'
import { Figure } from '../components/Figure.jsx'
import { C } from '../lib/content.js'
import { Empty } from './LearnStats.jsx'

export function FormulasScreen({ ctx }) {
  const [q, setQ] = useState("")
  const [topic, setTopic] = useState(null)
  const term = q.trim().toLowerCase()
  const list = useMemo(() => C.formulas.filter((f) =>
    (!topic || f.topic === topic) &&
    (!term || (f.name + ' ' + (f.note || '') + ' ' + f.latex).toLowerCase().includes(term))
  ), [term, topic])

  return (
    <div className="wrap fade-in" style={{ maxWidth: 880 }}>
      <h2 style={{ fontSize: 24, letterSpacing: "-.03em", margin: "0 0 4px" }}>Шпаргалка формул</h2>
      <p style={{ color: "var(--tx-3)", marginTop: 0, marginBottom: 20, fontSize: 14 }}>{C.formulas.length} формул курса — поиск и фильтр по темам</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--tx-3)", pointerEvents: "none" }}><I.filter size={15} /></span>
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Поиск формулы…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={!topic ? "on" : ""} onClick={() => setTopic(null)}>Все</button>
          {C.topics.map((t) => <button key={t.id} className={topic === t.id ? "on" : ""} onClick={() => setTopic(t.id)}>{t.short}</button>)}
        </div>
      </div>

      {list.length === 0 ? <Empty text="Ничего не найдено" />
        : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map((f) => (
            <div key={f.id} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3 }}>{f.name}</span>
                <span style={{ flex: "0 0 auto" }}><TopicChip topic={f.topic} small /></span>
              </div>
              <TexBlock tex={f.latex} />
              {f.note && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--tx-2)" }}><RichText text={f.note} /></p>}
              {f.figure && <Figure name={f.figure} caption={f.figureCaption} />}
            </div>
          ))}
        </div>}
    </div>
  )
}
```

- [ ] **Step 2: Подключить в App**

In `src/App.jsx`:

Импорт:
```jsx
import { FormulasScreen } from './screens/Formulas.jsx'
```

В `NAVMAP`:
```jsx
    formulas: { label: "Формулы", icon: "book" },
```

В `GROUPS` группа «Материалы» — добавить `...(feat.formulas ? ["formulas"] : [])` (после flashcards). Итог группы «Материалы»:
```jsx
    { label: "Материалы", items: ["learn", ...(feat.flashcards ? ["flashcards"] : []), ...(feat.formulas ? ["formulas"] : []), ...(feat.glossary ? ["glossary"] : [])] },
```

В `MOBILE_MORE` добавить `...(feat.formulas ? ["formulas"] : [])`.

В `renderScreen()`:
```jsx
      case "formulas": return <FormulasScreen ctx={ctx} />;
```

- [ ] **Step 3: Сборка**

Run: `npm run build`
Expected: SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Formulas.jsx src/App.jsx
git commit -m "feat(formulas): formula cheatsheet screen with search/filter"
```

---

### Task A6: Новая таксономия тем матстата + валидатор контента

**Files:**
- Modify: `api/_data/matstat/questions.js` (только TOPICS + чистка старых вопросов)
- Test: `test/matstat-content.test.js`

- [ ] **Step 1: Заменить TOPICS и очистить вопросы-заглушки**

In `api/_data/matstat/questions.js`, заменить `TOPICS` на новую таксономию и временно оставить `QUESTIONS = []` (банк наполняется в Phase B). Полный новый верх файла:

```js
/* matstat/questions.js — вопросы по математической статистике (LaTeX в q/options/explain;
   опционально figure:"<key>" — статичный SVG из public/figures/matstat). */
export const TOPICS = [
  { id: "desc",  name: "Описательная статистика и ЭФР",  short: "ОС", color: "#22c55e", accent: "#22c55e" },
  { id: "order", name: "Порядковые статистики",          short: "ПС", color: "#10b981", accent: "#10b981" },
  { id: "est",   name: "Точечное оценивание",            short: "ОЦ", color: "#a855f7", accent: "#a855f7" },
  { id: "props", name: "Свойства оценок",                short: "СВ", color: "#8b5cf6", accent: "#8b5cf6" },
  { id: "ci",    name: "Доверительные интервалы",        short: "ДИ", color: "#f59e0b", accent: "#f59e0b" },
  { id: "ht",    name: "Проверка гипотез",               short: "ПГ", color: "#ef4444", accent: "#ef4444" },
  { id: "chi2",  name: "Критерии χ²",                     short: "χ²", color: "#f97316", accent: "#f97316" },
  { id: "reg",   name: "Линейная регрессия",             short: "РГ", color: "#3b82f6", accent: "#3b82f6" },
  { id: "sp",    name: "Случайные процессы",             short: "СП", color: "#06b6d4", accent: "#06b6d4" },
  { id: "py",    name: "Python-вычисления",              short: "Py", color: "#eab308", accent: "#eab308" },
];

export const QUESTIONS = [];
```

> Старые ачивки матстата (`api/_data/matstat/achievements.js`) ссылаются на topicMastery `prob` — поменять `topic: "prob"` на `topic: "ci"` (или удалить эту ачивку), чтобы не указывать на несуществующую тему. Сделать в этом шаге: открыть `achievements.js`, в правиле с `kind:"topicMastery"` заменить `topic: "prob"` → `topic: "ci"`, а `desc:"Распределения на 60%"` → `desc:"Доверительные интервалы на 60%"`, `name:"Вероятностник"` → `name:"Интервальщик"`.

- [ ] **Step 2: Падающий тест-валидатор банка**

Create `test/matstat-content.test.js`:

```js
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import katex from 'katex'
import { QUESTIONS, TOPICS } from '../api/_data/matstat/questions.js'
import { FLASHCARDS } from '../api/_data/matstat/flashcards.js'
import { FORMULAS } from '../api/_data/matstat/formulas.js'
import { splitMath } from '../src/lib/mathtext.js'

const TOPIC_IDS = new Set(TOPICS.map((t) => t.id))
const FIG_DIR = path.resolve('public/figures/matstat')

// Каждый сегмент-формула из строки должен рендериться KaTeX без выброса.
function assertRenders(str, where) {
  for (const seg of splitMath(str)) {
    if (seg.type === 'text') continue
    expect(() => katex.renderToString(seg.value, { displayMode: seg.type === 'block', throwOnError: true }),
      `LaTeX не рендерится в ${where}: ${seg.value}`).not.toThrow()
  }
}
function figExists(name) {
  return fs.existsSync(path.join(FIG_DIR, name + '.svg'))
}

describe('matstat content bank', () => {
  it('у каждого вопроса валидная тема, ключ ответа и рендеримый LaTeX', () => {
    for (const q of QUESTIONS) {
      expect(TOPIC_IDS.has(q.topic), `тема ${q.topic} у ${q.id}`).toBe(true)
      expect(Array.isArray(q.correct) && q.correct.length >= 1, `correct у ${q.id}`).toBe(true)
      for (const c of q.correct) expect(c >= 0 && c < q.options.length, `индекс ${c} у ${q.id}`).toBe(true)
      assertRenders(q.q, q.id + '.q')
      q.options.forEach((o, i) => assertRenders(o, `${q.id}.opt${i}`))
      assertRenders(q.explain, q.id + '.explain')
      if (q.figure) expect(figExists(q.figure), `нет figure ${q.figure} у ${q.id}`).toBe(true)
    }
  })

  it('флеш-карточки: тема + рендеримый LaTeX', () => {
    for (const c of FLASHCARDS) {
      expect(TOPIC_IDS.has(c.topic), `тема у ${c.id}`).toBe(true)
      assertRenders(c.front, c.id + '.front')
      assertRenders(c.back, c.id + '.back')
      if (c.figure) expect(figExists(c.figure), `нет figure ${c.figure} у ${c.id}`).toBe(true)
    }
  })

  it('формулы: тема + рендеримый display-LaTeX', () => {
    for (const f of FORMULAS) {
      expect(TOPIC_IDS.has(f.topic), `тема у ${f.id}`).toBe(true)
      expect(() => katex.renderToString(f.latex, { displayMode: true, throwOnError: true }),
        `formula ${f.id}: ${f.latex}`).not.toThrow()
      if (f.figure) expect(figExists(f.figure), `нет figure ${f.figure} у ${f.id}`).toBe(true)
    }
  })

  it('id уникальны в каждом массиве', () => {
    for (const [name, arr] of [['Q', QUESTIONS], ['F', FLASHCARDS], ['FM', FORMULAS]]) {
      const ids = arr.map((x) => x.id)
      expect(new Set(ids).size, `дубли id в ${name}`).toBe(ids.length)
    }
  })
})
```

- [ ] **Step 3: Запустить — зелёный на пустых массивах**

Run: `npm test -- matstat-content`
Expected: PASS (все циклы пустые на старте — это базовая линия; по мере наполнения в Phase B тест ловит ошибки).

- [ ] **Step 4: Полный прогон + сборка**

Run: `npm test && npm run build`
Expected: PASS + SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add api/_data/matstat/questions.js api/_data/matstat/achievements.js test/matstat-content.test.js
git commit -m "feat(matstat): 10-topic taxonomy + content-bank validation test"
```

---

# PHASE B — Контент по темам

**Единый рецепт темы (применяется в каждой задаче B1…B10).** Источник — разобранные материалы курса (формулы, типовые задачи с реальными числами/ответами, спецификации графиков ниже в каждой задаче). Для темы `<T>` исполнитель:

1. **Графики:** создать `scripts/figures/fig_<T>.py` с функцией `build()`, рендерящей перечисленные SVG в `public/figures/matstat/`; добавить ключи в подписи. Запустить `python build.py`, закоммитить SVG.
2. **Формулы:** добавить объекты в `FORMULAS` (`api/_data/matstat/formulas.js`): `{ id:"fm_<T>_N", topic:"<T>", name, latex, note?, figure? }`. Перечень формул дан в задаче.
3. **Флеш-карточки:** добавить в `FLASHCARDS` (`flashcards.js`): `{ id:"fc_<T>_N", topic:"<T>", front, back, figure? }`. Перечень — в задаче.
4. **Квиз-вопросы:** добавить в `QUESTIONS` (`questions.js`): `{ id:"<T>N", topic:"<T>", difficulty, q, options:[…], correct:[…], multi?, explain, viz?, figure? }`. Перечень с числами/ответами — в задаче.
5. **Прогнать** `npm test -- matstat-content` (валидатор: темы, ключи, LaTeX, наличие SVG) → PASS; затем `npm test && npm run build`; commit.

**Acceptance per topic:** ≥ указанного числа вопросов/карточек/формул/графиков; валидатор зелёный.

> Задача **B1 ниже расписана полностью (готовые объекты)** — это эталон формата. B2…B10 дают grounded-источник (реальные формулы, задачи с числами и ответами, спецификации графиков), который исполнитель переносит в тот же формат. Все числа/ответы взяты из решений курса.

---

### Task B1: Тема «Порядковые статистики» (`order`) — ЭТАЛОН (полностью готовые объекты)

**Files:**
- Create: `scripts/figures/fig_order.py`
- Modify: `api/_data/matstat/formulas.js`, `flashcards.js`, `questions.js`

- [ ] **Step 1: Графики темы**

Create `scripts/figures/fig_order.py`:

```python
"""Графики темы «Порядковые статистики»."""
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
from _style import save, ACCENT, TX3

def build():
    # order_min_density: плотность минимума X_(1) для U[0,1], разные n
    x = np.linspace(0, 1, 400)
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    for n in (2, 5, 10, 20):
        ax.plot(x, n * (1 - x) ** (n - 1), lw=2, label=f"n={n}")
    ax.set_title(r"Плотность минимума $X_{(1)}$, $U[0,1]$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$f_{(1)}(x)$"); ax.legend()
    save(fig, "order_min_density")

    # order_cdf_k: ФР k-й порядковой статистики для U[0,1], n=10
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    n = 10
    for k in (1, 3, 5, 7, 10):
        cdf = stats.binom.sf(k - 1, n, x)  # P(Bin(n,x) >= k)
        ax.plot(x, cdf, lw=2, label=f"k={k}")
    ax.plot(x, x, ls="--", color=TX3, lw=1, label="F=x")
    ax.set_title(r"ФР порядковой статистики $X_{(k)}$, $U[0,1]$, $n=10$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$F_{(k)}(x)$"); ax.legend(fontsize=8)
    save(fig, "order_cdf_k")

    # order_max_uniform: ФР максимума (x/θ)^n, θ=1 — состоятельность оценки
    fig, ax = plt.subplots(figsize=(5.4, 3.0))
    for n in (5, 10, 20, 50):
        ax.plot(x, x ** n, lw=2, label=f"n={n}")
    ax.set_title(r"ФР максимума $X_{(n)}$, $U[0,\theta]$, $\theta=1$")
    ax.set_xlabel("x"); ax.set_ylabel(r"$F_{(n)}(x)$"); ax.legend()
    save(fig, "order_max_uniform")

if __name__ == "__main__":
    build()
```

Run:
```bash
cd scripts/figures && . .venv/bin/activate && python build.py && deactivate && cd ../..
```
Expected: созданы `order_min_density.svg`, `order_cdf_k.svg`, `order_max_uniform.svg`.

- [ ] **Step 2: Формулы темы (добавить в `formulas.js`)**

In `api/_data/matstat/formulas.js`, заменить `export const FORMULAS = []` на массив с этими элементами (если файл уже содержит элементы от других тем — добавить в массив):

```js
export const FORMULAS = [
  { id: "fm_order_1", topic: "order", name: "ФР минимума и максимума",
    latex: "F_{(1)}(x)=1-(1-F(x))^n,\\qquad F_{(n)}(x)=F(x)^n",
    note: "Минимум: хотя бы один $\\ge x$; максимум: все $< x$.", figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]" },
  { id: "fm_order_2", topic: "order", name: "ФР k-й порядковой статистики",
    latex: "F_{(k)}(x)=\\sum_{m=k}^{n}\\binom{n}{m}F(x)^m(1-F(x))^{n-m}=I_{F(x)}(k,\\,n-k+1)",
    note: "Число элементов $<x$ имеет $\\mathrm{Bin}(n,F(x))$; $I_x$ — неполная бета-функция.", figure: "order_cdf_k", figureCaption: "F_(k) для U[0,1], n=10" },
  { id: "fm_order_3", topic: "order", name: "Плотность k-й порядковой статистики",
    latex: "f_{(k)}(x)=\\frac{n!}{(k-1)!(n-k)!}\\,F(x)^{k-1}(1-F(x))^{n-k}f(x)",
    note: "Для $U[0,1]$ это бета-распределение $\\mathrm{Beta}(k,\\,n-k+1)$." },
  { id: "fm_order_4", topic: "order", name: "Моменты порядковой статистики (U[0,1])",
    latex: "\\mathrm{M}X_{(k)}=\\frac{k}{n+1},\\qquad \\mathrm{D}X_{(k)}=\\frac{k(n-k+1)}{(n+1)^2(n+2)}",
    note: "Следствие бета-распределения." },
  { id: "fm_order_5", topic: "order", name: "Плотность минимума (U[0,1])",
    latex: "f_{(1)}(x)=n(1-x)^{n-1},\\quad \\mathrm{M}X_{(1)}=\\frac{1}{n+1},\\quad \\mathrm{D}X_{(1)}=\\frac{n}{(n+1)^2(n+2)}",
    figure: "order_min_density", figureCaption: "Плотность минимума для U[0,1]" },
]
```

- [ ] **Step 3: Флеш-карточки темы (добавить в `flashcards.js`)**

In `api/_data/matstat/flashcards.js`, заменить `export const FLASHCARDS = []` на:

```js
export const FLASHCARDS = [
  { id: "fc_order_1", topic: "order", front: "ФР минимума $X_{(1)}$ выборки из $F(x)$?", back: "$F_{(1)}(x)=1-(1-F(x))^n$" },
  { id: "fc_order_2", topic: "order", front: "ФР максимума $X_{(n)}$?", back: "$F_{(n)}(x)=F(x)^n$" },
  { id: "fc_order_3", topic: "order", front: "ФР $k$-й порядковой статистики?", back: "$F_{(k)}(x)=\\sum_{m=k}^{n}\\binom{n}{m}F^m(1-F)^{n-m}$" },
  { id: "fc_order_4", topic: "order", front: "Плотность $f_{(k)}(x)$?", back: "$f_{(k)}(x)=\\dfrac{n!}{(k-1)!(n-k)!}F^{k-1}(1-F)^{n-k}f$" },
  { id: "fc_order_5", topic: "order", front: "$\\mathrm{M}X_{(k)}$ и $\\mathrm{D}X_{(k)}$ для $U[0,1]$?", back: "$\\mathrm{M}X_{(k)}=\\dfrac{k}{n+1},\\quad \\mathrm{D}X_{(k)}=\\dfrac{k(n-k+1)}{(n+1)^2(n+2)}$" },
  { id: "fc_order_6", topic: "order", front: "Распределение $X_{(k)}$ для $U[0,1]$ — какое семейство?", back: "Бета-распределение $\\mathrm{Beta}(k,\\,n-k+1)$." },
  { id: "fc_order_7", topic: "order", front: "$f_{(1)}(x)$ для $U[0,1]$?", back: "$f_{(1)}(x)=n(1-x)^{n-1}$, $\\ \\mathrm{M}X_{(1)}=\\dfrac1{n+1}$" },
]
```

- [ ] **Step 4: Квиз-вопросы темы (добавить в `questions.js`)**

In `api/_data/matstat/questions.js`, заполнить `QUESTIONS` (сейчас `[]`) этими объектами:

```js
export const QUESTIONS = [
  {
    id: "order1", topic: "order", difficulty: 1, figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]",
    q: "Чему равна функция распределения максимума $X_{(n)}=\\max\\{X_1,\\dots,X_n\\}$ выборки из распределения $F(x)$?",
    options: ["$F_{(n)}(x)=F(x)^n$", "$F_{(n)}(x)=1-(1-F(x))^n$", "$F_{(n)}(x)=nF(x)$", "$F_{(n)}(x)=F(x)^{1/n}$"],
    correct: [0], multi: false,
    explain: "Все элементы должны быть меньше $x$: $\\mathrm{P}(X_{(n)}<x)=\\mathrm{P}(X_1<x,\\dots,X_n<x)=F(x)^n$ в силу независимости.",
  },
  {
    id: "order2", topic: "order", difficulty: 1,
    q: "Чему равна ФР минимума $X_{(1)}$ выборки из $F(x)$?",
    options: ["$1-(1-F(x))^n$", "$F(x)^n$", "$1-F(x)^n$", "$n(1-F(x))$"],
    correct: [0], multi: false,
    explain: "$\\mathrm{P}(X_{(1)}<x)=1-\\mathrm{P}(\\text{все}\\ \\ge x)=1-(1-F(x))^n$.",
  },
  {
    id: "order3", topic: "order", difficulty: 2, figure: "order_cdf_k", figureCaption: "F_(k) для U[0,1], n=10",
    q: "ФР $k$-й порядковой статистики выражается через биномиальные вероятности. Почему?",
    options: [
      "Событие $\\{X_{(k)}<x\\}$ значит «не менее $k$ элементов $<x$», а число таких элементов $\\sim\\mathrm{Bin}(n,F(x))$",
      "Порядковые статистики независимы и одинаково распределены",
      "Сумма порядковых статистик имеет биномиальное распределение",
      "Это верно только для дискретных распределений",
    ],
    correct: [0], multi: false,
    explain: "Каждый элемент попадает «левее $x$» с вероятностью $p=F(x)$ независимо, поэтому число элементов $<x$ есть $\\mathrm{Bin}(n,F(x))$, и $F_{(k)}(x)=\\sum_{m=k}^n\\binom{n}{m}F^m(1-F)^{n-m}$.",
  },
  {
    id: "order4", topic: "order", difficulty: 2, figure: "order_min_density", figureCaption: "Плотность минимума для U[0,1]",
    q: "Для выборки из $U[0,1]$ чему равно $\\mathrm{M}X_{(1)}$ (матожидание минимума)?",
    options: ["$\\dfrac{1}{n+1}$", "$\\dfrac{1}{n}$", "$\\dfrac{n}{n+1}$", "$\\dfrac{1}{2n}$"],
    correct: [0], multi: false,
    explain: "Плотность $f_{(1)}(x)=n(1-x)^{n-1}$; интеграл $\\int_0^1 x\\,n(1-x)^{n-1}dx=\\frac{1}{n+1}$. Это частный случай $\\mathrm{Beta}(1,n)$.",
  },
  {
    id: "order5", topic: "order", difficulty: 2,
    q: "Распределение $k$-й порядковой статистики выборки из $U[0,1]$ — это…",
    options: ["$\\mathrm{Beta}(k,\\,n-k+1)$", "$\\mathrm{Beta}(n-k+1,\\,k)$", "$\\mathrm{Bin}(n,k/n)$", "$\\mathrm{Gamma}(k,1)$"],
    correct: [0], multi: false,
    explain: "Плотность $f_{(k)}(x)=\\frac{n!}{(k-1)!(n-k)!}x^{k-1}(1-x)^{n-k}$ — ровно плотность $\\mathrm{Beta}(k,\\,n-k+1)$; отсюда $\\mathrm{M}X_{(k)}=\\frac{k}{n+1}$.",
  },
  {
    id: "order6", topic: "order", difficulty: 3, figure: "order_max_uniform", figureCaption: "ФР максимума для U[0,θ]",
    q: "Для $X_i\\sim U[0,\\theta]$ оценка $\\hat\\theta_n=X_{(n)}$. Почему она состоятельна?",
    options: [
      "$\\mathrm{P}(|X_{(n)}-\\theta|>\\varepsilon)=\\big(\\tfrac{\\theta-\\varepsilon}{\\theta}\\big)^n\\to0$",
      "$X_{(n)}$ несмещена, поэтому состоятельна",
      "$\\mathrm{M}X_{(n)}=\\theta$ при любом $n$",
      "$X_{(n)}$ имеет нормальное распределение при больших $n$",
    ],
    correct: [0], multi: false,
    explain: "$F_{X_{(n)}}(x)=(x/\\theta)^n$, поэтому $\\mathrm{P}(X_{(n)}<\\theta-\\varepsilon)=((\\theta-\\varepsilon)/\\theta)^n\\to0$ — сходимость по вероятности к $\\theta$. При этом оценка смещена: $\\mathrm{M}X_{(n)}=\\frac{n}{n+1}\\theta$.",
  },
]
```

- [ ] **Step 5: Валидатор + полный прогон**

Run: `npm test -- matstat-content`
Expected: PASS (вопросы/карточки/формулы валидны, LaTeX рендерится, SVG найдены).

Run: `npm test && npm run build`
Expected: PASS + SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add scripts/figures/fig_order.py public/figures/matstat api/_data/matstat/formulas.js api/_data/matstat/flashcards.js api/_data/matstat/questions.js
git commit -m "content(matstat): order statistics — questions, flashcards, formulas, figures"
```

---

### Task B2: Тема «Описательная статистика и ЭФР» (`desc`)

Применить **единый рецепт темы** (вверху Phase B). Источник (реальные формулы/задачи/ответы курса):

**Графики `scripts/figures/fig_desc.py`** (≥3 SVG):
- `desc_polygon_hist` — полигон относительных частот и столбчатая гистограмма для дискретной выборки $x\in\{7,8,9,10,11\}$, $w=\{5,6,6,6,1\}/24$ (два subplot).
- `desc_ecdf` — ступенчатая ЭФР $F_n^*(x)$ для выборки из $\mathrm{Exp}(1)$, $n=24$, поверх теоретической $F(x)=1-e^{-x}$; вертикаль в $x=1$ с метками $F(1)\approx0.632$.
- `desc_ecdf_convergence` — несколько реализаций $F_n^*$ при $n=20,100,500$ для $\mathrm{Exp}(1)$ (сужение коридора).
- `desc_hist_widths` — две гистограммы одних данных при $\Delta=2.5$ и $\Delta=5$.

**Формулы `FORMULAS` (≥6):**
- $w_i=\dfrac{n_i}{n},\ \sum_i w_i=1$ (относительные частоты).
- $\bar x=\dfrac1n\sum x_i=\dfrac{\sum_j x_j n_j}{n}$.
- $s^2=\dfrac1n\sum (x_i-\bar x)^2=\dfrac1n\sum x_i^2-\bar x^2$ (смещённая дисперсия).
- $S^2=\dfrac{n}{n-1}s^2$ (исправленная).
- Высота столбца гистограммы $h_i=\dfrac{w_i}{\Delta}$.
- $F_n^*(x)=\dfrac1n\sum_{i=1}^n \mathbf 1\{X_i\le x\}$ (ЭФР).
- ЦПТ для ЭФР: $\sqrt n\big(F_n^*(x_0)-F(x_0)\big)\xrightarrow{d}N\big(0,F(x_0)(1-F(x_0))\big)$.

**Флеш-карточки `FLASHCARDS` (≥7):** front→back по каждой формуле выше + «чем $s^2$ отличается от $S^2$» (делитель $n$ vs $n-1$, $\mathrm{M}s^2=\frac{n-1}{n}\sigma^2$).

**Квиз-вопросы `QUESTIONS` (≥8)** — с реальными числами курса:
- Q: значения $\bar x, s^2, S^2$ для выборки ДЗ1 з.1 ($\bar x=26/3\approx8.667$, $s^2=25/18\approx1.389$, $S^2=100/69\approx1.449$). correct — верная тройка.
- Q: высота столбца гистограммы при $w=0.3,\ \Delta=2.5$ → $h=0.12$.
- Q: значение $F_n^*$ на ступени (ДЗ1 з.1: при $8<x\le9$ → $11/24$).
- Q (figure `desc_ecdf`): что описывает $F_n^*(x)$ — доля наблюдений $\le x$.
- Q (figure `desc_ecdf_convergence`, difficulty 2): ЦПТ для ЭФР — предельная дисперсия $F(x_0)(1-F(x_0))$.
- Q (P7 из ДЗ1, difficulty 2): для $X\sim\mathrm{Exp}(1)$ оценить $\mathrm P(|F_n^*(1)-F(1)|\le1/\sqrt n)\approx 2\Phi(1/\sqrt{F(1)(1-F(1))})-1\approx0.9616$; $F(1)=1-e^{-1}\approx0.632$.
- Q: смысл исправленной дисперсии $S^2$ — несмещённая оценка $\sigma^2$.
- Q (multi): какие из величин — меры разброса (дисперсия, СКО, размах, IQR; мода — нет).

Acceptance: ≥8 вопросов, ≥7 карточек, ≥6 формул, ≥3 SVG; валидатор зелёный. Commit `content(matstat): descriptive stats & ECDF`.

---

### Task B3: Тема «Точечное оценивание» (`est`)

**Графики `fig_est.py` (≥2):**
- `est_order_uniform` — плотности $f_{(1)}$ и $f_{(n)}$ для $U[\theta_1,\theta_2]$ при $n=5,10,30$ (сходимость ОМП к границам).
- `est_mm_vs_ml` — для $U[0,\theta]$: гистограмма Монте-Карло оценок $\hat\theta^{MM}=2\bar X$ и $\hat\theta^{ML}=X_{(n)}$ при истинном $\theta=1$, $n=20$ (смещение/разброс).

**Формулы `FORMULAS` (≥7):**
- Метод моментов: $\frac1n\sum X_i^k=\mu_k(\theta)\Rightarrow\hat\theta$.
- ММП: $\hat\theta=\arg\max_\theta\prod f(X_i;\theta)$; $\ell(\theta)=\sum\ln f(X_i;\theta)$.
- $U[\theta_1,\theta_2]$: $\hat\theta_1^{MM}=\bar X-\sqrt{3s^2}$, $\hat\theta_2^{MM}=\bar X+\sqrt{3s^2}$; $\hat\theta_1^{ML}=X_{(1)}$, $\hat\theta_2^{ML}=X_{(n)}$.
- Несмещённые поправки: $\tilde\theta_1=\frac{nX_{(1)}-X_{(n)}}{n-1}$, $\tilde\theta_2=\frac{nX_{(n)}-X_{(1)}}{n-1}$.
- $N(a,\sigma^2)$: $\hat a^{MM}=\hat a^{ML}=\bar X$, $\widehat{\sigma^2}^{ML}=s^2$.
- Сдвинутое показательное $f=\theta_2 e^{-\theta_2(x-\theta_1)}$: $\hat\theta_2^{MM}=1/s$, $\hat\theta_1^{MM}=\bar X-s$; $\hat\theta_1^{ML}=X_{(1)}$, $\hat\theta_2^{ML}=1/(\bar X-X_{(1)})$.
- Геометрическое: $\hat\theta^{ML}=\bar X$.

**Флеш-карточки (≥8):** определения ММ/ММП; ОМП границ для $U$; почему $\hat\theta_1^{ML}=X_{(1)}$ (правдоподобие максимально при минимальном диапазоне); несмещённые поправки.

**Квиз-вопросы (≥8)** с числами из ДЗ2:
- ММ для $U[\theta_1,\theta_2]$ → $\hat\theta_{1,2}=\bar X\mp\sqrt{3s^2}$.
- ММП для $U[\theta_1,\theta_2]$ → $X_{(1)},X_{(n)}$ (difficulty 2, объяснить логику правдоподобия).
- ММП дисперсии $N$ → $s^2$ (делитель $n$).
- ММ vs ММП для сдвинутого показательного (difficulty 3).
- ММП геометрического → $\bar X$.
- Несмещённая поправка к $X_{(n)}$ для $U[0,\theta]$: $\tilde\theta=\frac{n+1}{n}X_{(n)}$ (difficulty 3).
- (figure `est_mm_vs_ml`) сравнение смещения $\bar X$-оценки и $X_{(n)}$.

Acceptance: ≥8/≥8/≥7/≥2. Commit `content(matstat): point estimation (MM, MLE)`.

---

### Task B4: Тема «Свойства оценок» (`props`)

**Графики `fig_props.py` (≥2):**
- `props_bias_s2` — Монте-Карло: гистограммы $s^2$ и $S^2$ при $\sigma^2=1$, $n=10$; вертикали $\mathrm M s^2=\frac{n-1}{n}$ и $\mathrm M S^2=1$.
- `props_efficiency` — для распределения Лапласа: $\mathrm D\bar X=2\lambda^2/n$ vs граница Рао–Крамера $\lambda^2/n$ как функция $n$ (две кривые).

**Формулы `FORMULAS` (≥6):**
- Несмещённость $\mathrm M\hat\theta=\theta$; состоятельность $\hat\theta\xrightarrow{P}\theta$.
- $\mathrm M s^2=\frac{n-1}{n}\sigma^2$; $S^2=\frac{n}{n-1}s^2$ — несмещённая.
- Информация Фишера: $I(\theta)=\mathrm M[(\partial_\theta\ln f)^2]=-\mathrm M[\partial^2_\theta\ln f]$.
- Граница Рао–Крамера: $\mathrm D\hat\theta\ge\frac{1}{nI(\theta)}$.
- Геометрическое: $I(\theta)=\frac{1}{\theta(\theta-1)}$, $\bar X$ эффективна.
- Лаплас $f=\frac1{2\lambda}e^{-|x-\theta|/\lambda}$: $I=1/\lambda^2$, $\mathrm D\bar X=2\lambda^2/n>$ границы → $\bar X$ неэффективна (оптимум — медиана).

**Флеш-карточки (≥7):** все определения выше + «оценка состоятельна, но смещена — пример $X_{(n)}$» + «эффективность = достижение границы Рао–Крамера».

**Квиз-вопросы (≥8)** с числами из ДЗ1/ДЗ2:
- Несмещённая константа для $\sigma$ через $\frac1n\sum|X_i-m|$: $C=\sqrt{\pi/2}$ (difficulty 2).
- Биномиальная оценка $\hat\theta=\bar X(N-\bar X)/N$: $\mathrm M\hat\theta=\theta(1-\frac{1}{nN})$ — асимптотически несмещённая (difficulty 3).
- $I(\theta)$ геометрического и вывод эффективности $\bar X$ (difficulty 3).
- Лаплас: во сколько раз $\bar X$ хуже границы → в 2 раза; оптимальна медиана (difficulty 3).
- (figure `props_bias_s2`) почему делят на $n-1$.
- Состоятельность $X_{(n)}$ для $U[0,\theta]$.

Acceptance: ≥8/≥7/≥6/≥2. Commit `content(matstat): estimator properties (bias, consistency, Fisher, Cramér–Rao)`.

---

### Task B5: Тема «Доверительные интервалы» (`ci`)

**Графики `fig_ci.py` (≥3):**
- `ci_z_vs_t` — ширина $2z_{0.975}\sigma/\sqrt n$ (Z) vs $2t_{0.975,n-1}S/\sqrt n$ (t) как функция $n\in[5,200]$.
- `ci_chi2_var` — плотность $\chi^2(14)$ с закрашенными хвостами 2.5%, вертикали квантилей; иллюстрация асимметрии ДИ для дисперсии.
- `ci_prop_width` — ширина ДИ для доли $2z\sqrt{\hat p(1-\hat p)/n}$ как функция $\hat p\in[0,1]$ при $n=100,500,2000$ (макс при $\hat p=0.5$).
- `ci_len_vs_n` — длина ДИ для МО как функция $n$ с горизонталью целевой длины и отметкой $n_{\min}$.

**Формулы `FORMULAS` (≥7):**
- Z-интервал: $\bar X\pm z_{1-\alpha/2}\frac{\sigma}{\sqrt n}$.
- t-интервал: $\bar X\pm t_{1-\alpha/2,n-1}\frac{S}{\sqrt n}$ (и эквивалент $\frac{s}{\sqrt{n-1}}$).
- ДИ для доли: $\hat p\pm z_{1-\alpha/2}\sqrt{\frac{\hat p(1-\hat p)}{n}}$.
- Объём выборки (доля, повторный): $n=\frac{z^2 p(1-p)}{\varepsilon^2}$, $p=0.5$ если неизвестно.
- Объём (бесповторный): $n=\frac{Nz^2p(1-p)}{N\varepsilon^2+z^2p(1-p)}$.
- ДИ для дисперсии (МО неизв.): $\big(\frac{(n-1)S^2}{\chi^2_{1-\alpha/2}(n-1)},\frac{(n-1)S^2}{\chi^2_{\alpha/2}(n-1)}\big)$.
- ДИ для дисперсии (МО изв.): $\frac{n s^2}{\chi^2}$ с $\chi^2(n)$.
- ДИ для Пуассона: $\bar X\pm z\sqrt{\bar X/n}$.

**Флеш-карточки (≥8):** Z vs t (когда что), таблица квантилей ($z_{0.975}=1.96$, $z_{0.995}=2.576$, $t_{0.975,24}=2.064$), формула объёма выборки, асимметрия $\chi^2$-ДИ.

**Квиз-вопросы (≥10)** с реальными числами из ДЗ2/ДЗ3:
- ДИ для МО, $\sigma$ известна: $n=20,\sigma^2=4,\bar x=-2.998,\gamma=0.8$ → $(-3.571;-2.425)$; $n_{\min}=2629$ (difficulty 1-2).
- ДИ для МО, $\sigma$ неизв. (t): $n=25,\bar x=-1.251,s^2=3.677,\gamma=0.9$ → $(-1.921;-0.581)$.
- ДИ для дисперсии, МО изв. ($\chi^2(n)$): $n=30,s^2=27.277,\gamma=0.95$ → $(17.42;48.74)$.
- ДИ для дисперсии, МО неизв. ($\chi^2(n-1)$): $n=50,s^2=49.622,\gamma=0.99$ → $(31.41;91.22)$.
- ДИ для доли: $n=100,m=12,\gamma=0.95$ → $(0.056;0.184)$.
- ДИ для Пуассона: $n=200,\bar X=5.4,\gamma=0.99$ → $(4.98;5.82)$.
- Объём выборки для доли: $\varepsilon=0.02,\gamma=0.99$ → $n=4148$.
- Концептуальные: почему t шире Z; что значит «уровень доверия 0.95».

Acceptance: ≥10/≥8/≥7/≥3. Commit `content(matstat): confidence intervals`.

---

### Task B6: Тема «Проверка гипотез» (`ht`)

**Графики `fig_ht.py` (≥3):**
- `ht_errors` — две нормальные плотности $N(\mu_0,\sigma^2/n)$ и $N(\mu_1,\sigma^2/n)$; закрашены $\alpha$ (правый хвост) и $\beta$ (левый хвост второй); вертикаль критической точки.
- `ht_power_curve` — кривая мощности $W(\theta)$; интерактивный аналог делается в viz (Task B6 опц.), здесь статика.
- `ht_nmin_power` — $n_{\min}$ как функция требуемой мощности $1-\beta$ для разных размеров эффекта.
- `ht_t_dist` — плотности $t_{n-1}$ при $n=5,10,30$ и $N(0,1)$, закрашенные двусторонние хвосты.

**Формулы `FORMULAS` (≥7):**
- Ошибки: $\alpha=\mathrm P_{H_0}(\text{отвергнуть})$, $\beta=\mathrm P_{H_1}(\text{принять})$, мощность $W=1-\beta$.
- Лемма Неймана–Пирсона: НМК отвергает при $\ell(X)=\frac{L(\theta_1)}{L(\theta_0)}>c$.
- Z-критерий (известная $\sigma$): отвергнуть $H_0$ при $\bar X>\mu_0+z_{1-\alpha}\frac{\sigma}{\sqrt n}$.
- t-критерий: $T=\frac{\bar X-\mu_0}{S/\sqrt n}\sim t_{n-1}$; крит. область $|T|>t_{1-\alpha/2}(n-1)$.
- Двухвыборочный Z: $Z=\frac{\bar X-\bar Y}{\sqrt{\sigma_1^2/n_1+\sigma_2^2/n_2}}$.
- $\beta=\Phi\big(z_{1-\alpha}-\frac{(\mu_1-\mu_0)\sqrt n}{\sigma}\big)$.
- $n_{\min}=\big\lceil\big(\frac{(z_{1-\alpha}+z_{1-\beta})\sigma}{\mu_1-\mu_0}\big)^2\big\rceil$.

**Флеш-карточки (≥8):** определения ошибок/мощности, лемма Н–П, формула $\beta$, формула $n_{\min}$, отличие p-value от $\mathrm P(H_0)$.

**Квиз-вопросы (≥10)** с числами из ДЗ3/семинаров:
- НМК для $U[\theta,\theta+10]$: $\alpha=0.05$ → $c=19.5$, $\beta=0.45$, $W=0.55$ (difficulty 2).
- НМК биномиального $\mathrm{Bin}(60,p)$, $p_0=1/6,p_1=1/4,\alpha=0.05$ → $k=15$, $W\approx0.56$ (difficulty 2).
- НМК показательного, $\lambda_0=0.1,\lambda_1=0.05,n=50,\alpha=0.01$ → $T>679$, $W\approx0.995$ (difficulty 3).
- $n_{\min}$: $\theta_0=0,\theta_1=1,\sigma=1,\alpha=0.05,\beta\le0.01$ → $n=16$ (difficulty 2).
- Z-критерий: $n=100,N(\theta,1),H_0:\theta=0,H_1:\theta=0.5,\alpha=0.05,\bar X=0.153$ → не отвергаем; $\beta\approx0.0004$ (difficulty 2).
- (figure `ht_errors`) что закрашено $\alpha$/$\beta$.
- p-value — определение (difficulty 1).
- ошибка I рода — определение (difficulty 1).

**Интерактивный viz (добавить в `src/components/viz/matstat.jsx`):** `htpower` — слайдеры $n$ и размера эффекта $\Delta=\mu_1-\mu_0$, рисует две нормальные плотности и закрашивает $\alpha$/$\beta$, показывает $W=1-\beta$ численно. Зарегистрировать ключ. Один вопрос темы получает `viz:"htpower"`.

Acceptance: ≥10/≥8/≥7/≥3 + 1 viz. Commit `content(matstat): hypothesis testing (Neyman–Pearson, power)`.

---

### Task B7: Тема «Критерии χ²» (`chi2`)

**Графики `fig_chi2.py` (≥3):**
- `chi2_density_tail` — плотности $\chi^2_k$ для $k=1,2,3$; правый хвост $>\chi^2_{0.95}(k)$ закрашен; отметки критических значений (3.841, 5.991, 7.815).
- `chi2_obs_exp` — сдвоенная столбчатая «наблюдаемые vs ожидаемые» для задачи о кости ($O=[3,18,7,15,5,12]$, $E=10$).
- `chi2_contingency` — heatmap $2\times2$ таблицы сопряжённости с ожидаемыми частотами.

**Формулы `FORMULAS` (≥5):**
- Статистика согласия: $\chi^2=\sum_{i=1}^k\frac{(O_i-E_i)^2}{E_i}$, $E_i=np_i$.
- Степени свободы: $df=k-1-r$ ($r$ — число оценённых параметров).
- Независимость: $E_{ij}=\frac{n_{i\cdot}n_{\cdot j}}{n}$, $df=(r-1)(c-1)$.
- Требование $E_i\ge5$ (иначе объединять ячейки).
- Критические значения: $\chi^2_{0.95}(1)=3.841$, $(2)=5.991$, $(3)=7.815$.

**Флеш-карточки (≥7):** статистика, $df$ для согласия/независимости, правило $E_i\ge5$, как считать ожидаемые частоты в таблице.

**Квиз-вопросы (≥9)** с числами из ДЗ4/семинаров:
- Согласие $\mathrm{Exp}(1)$, $n=50$, 4 интервала: $\chi^2\approx0.687<7.815$ → не отвергаем (difficulty 1).
- Кость: $O=[3,18,7,15,5,12]$, $E=10$ → $\chi^2=17.6>11.07$ → отвергаем (difficulty 1, figure `chi2_obs_exp`).
- Новорождённые: $n=10000$, 5140 мальчиков, $H_0:p=0.5$ → $\chi^2=7.84>3.841$ → отвергаем (difficulty 1).
- Независимость $2\times2$ ветер/давление, $n=100$ → $\chi^2\approx0.667<3.841$ → независимы (difficulty 1).
- Однородность книги, $n=120$ → $\chi^2\approx13.71>3.841$ → отвергаем (difficulty 2).
- $df$ при оценке параметра: показательное со $\hat\lambda$ → $df=k-2$ (difficulty 2).
- (figure `chi2_density_tail`) правило отклонения по правому хвосту.
- Семьи $\mathrm{Bin}(2,0.5)$, $n=2020$: $\chi^2\approx2.67<5.991$ → не отвергаем (difficulty 2).

Acceptance: ≥9/≥7/≥5/≥3. Commit `content(matstat): chi-square tests (goodness-of-fit, independence)`.

---

### Task B8: Тема «Линейная регрессия» (`reg`)

**Графики `fig_reg.py` (≥3):**
- `reg_scatter_fit` — scatter 6 точек ДЗ4 з.5 + прямая $\hat y=0.100+1.986x$ + точка прогноза $(7,14.0)$.
- `reg_residuals` — «остатки vs предсказанные» для синтетической модели (гомоскедастичность).
- `reg_ci_pred` — линия регрессии + заливка ДИ для среднего отклика + заливка интервала предсказания (разная ширина).

**Формулы `FORMULAS` (≥6):**
- $\hat\beta_1=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}=\frac{S_{xy}}{S_{xx}}$, $\hat\beta_0=\bar y-\hat\beta_1\bar x$.
- Прогноз $\hat y(x^*)=\hat\beta_0+\hat\beta_1 x^*$.
- $t$-статистика коэффициента: $t_j=\frac{\hat\beta_j}{SE(\hat\beta_j)}\sim t_{df}$, $df=n-k-1$.
- ДИ коэффициента: $\hat\beta_j\pm t_{\alpha/2,df}\,SE(\hat\beta_j)$.
- Множественная МНК: $\hat\beta=(X^\top X)^{-1}X^\top y$.
- $R^2$ — доля объяснённой дисперсии; интервал предсказания шире ДИ среднего (доп. дисперсия $\varepsilon$).

**Флеш-карточки (≥7):** формулы МНК, $t$-тест значимости, разница ДИ среднего vs интервала предсказания, смысл $R^2$, $df=n-2$ для парной.

**Квиз-вопросы (≥9)** с числами из ДЗ4/MS_task_3:
- Парная МНК ДЗ4 з.5: $\hat\beta_1=34.75/17.5=1.986$, $\hat\beta_0\approx0.100$, прогноз $\hat y(7)\approx14.00$ (difficulty 1-2, figure `reg_scatter_fit`).
- $t$-тест: $\beta_1$ значим ($t_1\approx55.7>2.365$), $\beta_2$ незначим ($t_2\approx1.59$); $CI_{0.95}(\beta_1)=(1.891;2.058)$ (difficulty 2).
- Знак наклона по данным цена/продажи ДЗ3: $\hat Y=21.10-18.56X$ (difficulty 2).
- (figure `reg_ci_pred`) почему интервал предсказания шире ДИ среднего (difficulty 2).
- Смысл $R^2=0.98$.
- $df$ остатков для $n=10$, 2 регрессора → 7.

Acceptance: ≥9/≥7/≥6/≥3. Commit `content(matstat): linear regression`.

---

### Task B9: Тема «Случайные процессы» (`sp`)

**Графики `fig_sp.py` (≥3):**
- `sp_brownian_bridge` — несколько траекторий $X(t)=W(t)-tW(1)$ на $[0,1]$ (нули на концах).
- `sp_telegraph` — ступенчатая траектория телеграфного сигнала $\{+1,-1\}$, пуассоновские скачки $\lambda=1$, $t\in[0,5]$.
- `sp_corr_telegraph` — $R_X(\tau)=e^{-2\tau}$ vs $\tau\in[0,3]$ (и сравнение с $e^{-\tau},e^{-3\tau}$).
- `sp_bridge_corr` — heatmap $R_X(t,s)=\min(t,s)-ts$ на $[0,1]^2$.

**Формулы `FORMULAS` (≥6):**
- Винер: $\mathrm M[W(u)W(v)]=\min(u,v)$.
- Броуновский мост $X(t)=W(t)-tW(1)$: $R_X(t,s)=\min(t,s)-ts$.
- Телеграф ($\lambda=1$): $R_X(t,s)=e^{-2|t-s|}$; МГФ пуассона $\mathrm M[z^{K(\tau)}]=e^{\tau(z-1)}$.
- ГБД $X(t)=e^{W(t)-t/2}-1$: $R_X(t,s)=e^{\min(t,s)}-1$.
- Сглаженный пуассон $X(t)=\frac{K(t+\varepsilon)-K(t)}{\varepsilon}$: $R_X(t,s)=\frac{\lambda}{\varepsilon^2}\max(\varepsilon-|t-s|,0)$.
- Квадратическая вариация: $\sum(\Delta W_i)^2\xrightarrow{СК}b-a$, $\mathrm D=2\sum(\Delta t_i)^2\to0$.

**Флеш-карточки (≥7):** ключевое свойство Винера, корр. функции моста/телеграфа/ГБД, МГФ пуассона, квадратическая вариация.

**Квиз-вопросы (≥8)** из семинаров/ДЗ4:
- $R_X$ броуновского моста → $\min(t,s)-ts$ (difficulty 2, figure `sp_bridge_corr`).
- $R_X$ телеграфа → $e^{-2|t-s|}$ (difficulty 3, figure `sp_corr_telegraph`).
- $R_X$ ГБД → $e^{\min(t,s)}-1$ (difficulty 3).
- двумерная ФР $X(t)=Vt^2+t$, $V\sim U[0,3]$ → $F_V(\min\{\dots\})$ (difficulty 2).
- квадратическая вариация → $b-a$ (difficulty 3).
- свойство $\mathrm M[W(u)W(v)]=\min(u,v)$ (difficulty 1).
- сглаженный пуассон → треугольная $R_X$ (difficulty 3, figure из спецификации).

Acceptance: ≥8/≥7/≥6/≥3. Commit `content(matstat): random processes`.

---

### Task B10: Тема «Python-вычисления» (`py`)

**Графики `fig_py.py` (≥2):**
- `py_corr_clean` — гистограммы переменной до/после фильтра выбросов (как в MS_task_2).
- `py_resid_diag` — «остатки vs предсказанные» + stem-plot остатков (как в MS_task_3).
- `py_pred_intervals` — линия регрессии + ДИ среднего + интервал предсказания (повтор из reg, но с акцентом на код).

**Формулы/код-заметки `FORMULAS` (≥5)** — здесь `latex` может быть формулой, `note` — питон-идиома:
- Корреляция: $r=\frac{\mathrm{cov}(X,Y)}{\sqrt{D_xD_y}}$; note: `scipy.stats.pearsonr(x,y)`.
- t-ДИ для среднего; note: `stats.t.interval(conf, df=n-1, loc=mean, scale=sem)`.
- $\chi^2$-ДИ для дисперсии; note: `(n-1)*var / stats.chi2.ppf([1-a/2, a/2], n-1)`.
- Парная регрессия; note: `scipy.stats.linregress(x,y)` → slope/intercept/r/p/se.
- Множественная регрессия; note: `statsmodels.api.OLS(y, sm.add_constant(X)).fit()`; `get_prediction().conf_int(obs=True)` — интервал предсказания.

**Флеш-карточки (≥6):** что считает `pearsonr`, как построить t-ДИ в scipy, разница `conf_int()` vs `conf_int(obs=True)`, чтение `summary()` ($R^2$, F, p-value), интерпретация $|r|$ (слабая/умеренная/сильная).

**Квиз-вопросы (≥7)** из MS_task_2/3 (реальные результаты):
- $r=0.145$ — слабая прямая связь, $p<0.05$ (difficulty 1).
- t-ДИ для среднего ЕГЭ 95%: $[69.41,70.48]$ (difficulty 1).
- $\chi^2$-ДИ для дисперсии ЕГЭ 95%: $[130.93,148.82]$.
- OLS $y=3+0.6x_1-0.4x_2$: $\hat\beta\approx(2.88,0.61,-0.40)$, $R^2=0.981$ (difficulty 2).
- интервал предсказания шире ДИ среднего: $[8.52,8.74]$ vs $[7.45,9.81]$ (difficulty 2, figure `py_pred_intervals`).
- какой вызов даёт интервал предсказания нового наблюдения (difficulty 2).
- интерпретация $|r|$: $0.3<|r|\le0.7$ — умеренная.

Acceptance: ≥7/≥6/≥5/≥2. Commit `content(matstat): python computational tasks`.

---

# PHASE C — Финал

### Task C1: Полная пересборка графиков, валидация банка, прод-проверка

**Files:** —

- [ ] **Step 1: Пересобрать ВСЕ фигуры из чистого окружения**

Run:
```bash
cd scripts/figures && . .venv/bin/activate && python build.py && deactivate && cd ../..
git status --porcelain public/figures/matstat
```
Expected: `build.py` печатает все модули без ошибок; `git status` показывает только ожидаемые SVG (никаких незакоммиченных «потерянных» фигур).

- [ ] **Step 2: Полный прогон тестов**

Run: `npm test`
Expected: PASS — включая `matstat-content` (все вопросы/карточки/формулы валидны, LaTeX рендерится, каждый `figure` имеет SVG, id уникальны), `mathtext`, `srs`, и существующие сьюты.

- [ ] **Step 3: Сводка по объёму банка (DOD-чек)**

Run:
```bash
node --input-type=module -e '
import { QUESTIONS, TOPICS } from "./api/_data/matstat/questions.js"
import { FLASHCARDS } from "./api/_data/matstat/flashcards.js"
import { FORMULAS } from "./api/_data/matstat/formulas.js"
const by = (arr) => Object.fromEntries(TOPICS.map(t => [t.id, arr.filter(x=>x.topic===t.id).length]))
console.log("questions:", QUESTIONS.length, by(QUESTIONS))
console.log("flashcards:", FLASHCARDS.length, by(FLASHCARDS))
console.log("formulas:", FORMULAS.length, by(FORMULAS))
'
```
Expected: каждая из 10 тем имеет ненулевые счётчики по всем трём массивам; суммарно ≥ ~85 вопросов, ≥ ~75 карточек, ≥ ~60 формул.

- [ ] **Step 4: Прод-сборка + DB-free smoke**

Run: `npm run build`
Expected: SUCCESS.

Run:
```bash
node --input-type=module -e '
import contentH from "./api/content.js"
const res={status(c){this._c=c;return this},setHeader(){},json(o){this._j=o}}
contentH({method:"GET",query:{quiz:"matstat"}},res)
const m=res._j
console.log("features:",JSON.stringify(m.features))
console.log("flashcards:",m.flashcards.length,"formulas:",m.formulas.length,"questions:",m.questions.length)
console.log("topics:",m.topics.map(t=>t.id).join(","))
'
```
Expected: `features` включает `flashcards:true, formulas:true`; массивы непустые; 10 тем.

- [ ] **Step 5: Ручной чек-лист (dev)**

Run: `npm run dev` (или `vercel dev` для API). Открыть `/matstat`. Expected:
- В навигации появились «Карточки» и «Формулы».
- В квизе формулы рендерятся (KaTeX), под разбором — matplotlib-SVG там, где задан `figure`.
- «Изучение» показывает формулы и графики.
- «Карточки»: flip работает, «Знаю/Повторить» сохраняется (перезагрузка сохраняет состояние).
- «Формулы»: поиск и фильтр по темам, display-формулы и графики.
- Интерактивный `htpower` viz реагирует на слайдеры.

- [ ] **Step 6: Commit (если пересборка фигур что-то изменила)**

```bash
git add public/figures/matstat
git commit -m "chore(figures): rebuild all matstat figures" || echo "nothing to rebuild"
```

---

## Self-Review

**1. Покрытие спеки:**
- LaTeX-рендеринг формул → Task A1 (KaTeX, splitMath, RichText/TexBlock), интеграция в квиз/изучение/карточки/шпаргалку (A3/A4/A5). ✅
- matplotlib-графики → Task A2 (python-пайплайн → SVG + Figure), фигуры в каждой теме B1–B10. ✅
- python scripts + latex для оформления → `scripts/figures/*.py` (matplotlib) + LaTeX-контент во всех карточках/формулах/вопросах. ✅
- «карточки» → Flashcards (A4) + контент. «вопросы» → квиз (A3) + контент. «формулы» → шпаргалка (A5) + `FORMULAS`. Интерактивные viz → matstat.jsx (B6). ✅
- DOD «100% к контрольной» → все 10 тем курса покрыты grounded-контентом из реальных решений (B1–B10), сводка объёма в C1 шаг 3. ✅
- Конспекты → экран «Формулы» (шпаргалка) + разборы в «Изучении». ✅

**2. Плейсхолдеры:** инфраструктурные задачи (A1–A6) содержат полный код и точные команды. Контент-задачи B2–B10 опираются на **реальные формулы, задачи с числами и ответами из разобранных материалов** (приведены в каждой задаче) + единый рецепт переноса в схему (показан полностью в эталоне B1) + автоматический валидатор (A6), ловящий незаполненные/битые элементы. Это не «TODO», а grounded-источник с проверкой. Где исполнителю нужен финальный JS-объект — формат задан дословно в B1.

**3. Согласованность типов/имён:**
- Схема вопроса: `{id,topic,difficulty,q,options,correct,multi?,explain,viz?,figure?,figureCaption?}` — единая в A3 (рендер), A6 (валидатор), B1–B10. ✅
- `FLASHCARDS`: `{id,topic,front,back,figure?,figureCaption?}` — A4 (экран), A6 (валидатор), B*. ✅
- `FORMULAS`: `{id,topic,name,latex,note?,figure?,figureCaption?}` — A5 (экран), A6 (валидатор), B*. ✅
- Фигуры: `name` → `/figures/matstat/<name>.svg`; `Figure` (A2) + ключи в `_style.save` (A2) + валидатор существования (A6). ✅
- `features.{flashcards,formulas}` — манифест (A3) → `/api/content` фиче-гейт (A3) → нав в App (A4/A5). ✅
- Темы (10 id) — `TOPICS` (A6) ↔ `topic` во всех контент-объектах (валидатор A6 проверяет принадлежность). ✅
- `splitMath`/`RichText`/`TexBlock` (A1) используются в Quiz/Learn (A3), Flashcards (A4), Formulas (A5). ✅
- `nextOrder/mergeRatings/dueCount/loadRatings/saveRatings` (A4) ↔ Flashcards (A4). ✅

Замечания: старые ачивки матстата (`topic:"prob"`) починены в A6 шаг 1, чтобы не указывать на исчезнувшую тему. Персистентность карточек — localStorage (без миграции БД), это осознанный выбор для ограничения объёма.
