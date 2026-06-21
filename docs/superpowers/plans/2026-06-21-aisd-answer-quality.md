# AiSD Answer-Quality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the "longest option is correct" tell across all 116 AiSD quiz questions, strengthen distractors so questions test real algorithm knowledge instead of length-guessing, and add harder questions (multi-select + difficulty-3), enforced by an automated guardrail test and re-validated by correctness agents.

**Architecture:** The quiz engine already shuffles option *positions* per render (`src/lib/quiz.js:29` `withShuffledOptions`, applied in `src/screens/Quiz.jsx:72,191`), so the "correct is always index 0" pattern is invisible to players — no position changes needed in data. The exploitable signal is **option length**: the correct option is the unique longest in 73% of questions (chance ≈ 25%). We add a guardrail test (`test/aisd-answer-quality.test.js`) that measures the length tell, multi-select count, and hard-question count, then balance option lengths and add hard questions file-by-file until the test passes. Each content file is edited and re-tested independently. Finally, correctness agents re-audit each section to ensure length-balancing didn't introduce a second correct answer or break a trace.

**Tech Stack:** JavaScript ES modules (content as plain data objects), Vitest, KaTeX (LaTeX in fields), Node.

---

## Problem Data (measured baseline)

Measured over the 116 single-answer questions in `api/_data/aisd/`:

- **Correct option is the unique longest: 85/116 = 73%** (chance ≈ 25%). This is the bug.
- Correct answer position: 116/116 at index 0 — **already neutralized at render** by `withShuffledOptions`. Do **not** reorder options or touch `correct` indices to "spread" positions; it has no player-visible effect and only risks mismatches.
- Multi-select questions: **0**. Difficulty histogram: {1: 11, 2: 69, 3: 36}.

Per-file offender ids (correct option is unique longest — must be length-balanced):

| File | Offender question ids |
|---|---|
| `topics/graph/floyd.js` | fw6, fw8, fw9 |
| `topics/graph/flow.js` | mf1, mf3, mf5, mf7, mf8, mf9 |
| `topics/graph/matching.js` | pm1, pm2, pm3, pm4, pm5, pm7, pm8, pm9 |
| `topics/graph/coloring.js` | gc1, gc3, gc4, gc5, gc9 |
| `topics/str/exact.js` | ex2, ex4, ex7, ex9 |
| `topics/str/edit.js` | ed1, ed2, ed6, ed7, ed8 |
| `topics/str/aho.js` | ah2, ah3, ah4, ah5, ah6, ah7 |
| `topics/str/strsort.js` | ss1, ss2, ss3, ss4, ss5, ss7 |
| `topics/str/coding.js` | cd2, cd3, cd4, cd6, cd8, cd9 |
| `topics/para/greedy.js` | gr1, gr2, gr3, gr5, gr6 |
| `topics/para/dp.js` | dp1, dp2, dp3, dp6, dp7 |
| `topics/para/branch.js` | bb1, bb2, bb3, bb4, bb5, bb6 |
| `topics/para/approx.js` | ap1, ap2, ap3, ap4, ap5, ap6 |
| `topics/para/random.js` | rd1, rd2, rd3, rd4, rd5, rd6 |
| `topics/para/complexity.js` | cx1, cx2, cx4, cx5, cx6, cx7, cx8, cx9 |

---

## Transformation Rules (apply to every offender)

The metric is **visual length** (LaTeX-normalized — see `visualLen` in the guardrail test). Optimize what the test measures.

1. **Lengthen the short distractors**, don't just trim the correct one. A good distractor is a *plausible near-miss* a student with shallow knowledge would believe — a real competing definition, a common wrong complexity, a swapped condition. Make each distractor a full clause comparable in length to the correct option.
2. **Trim the correct option** to its essential claim; move the justification into `explain`, never into the option text.
3. **Never change the correct option's truth or the answer key.** `correct` indices stay as-is.
4. **Never make a distractor accidentally true.** Each distractor must be defensibly wrong. (Agents verify this in Task 18.)
5. **Keep all LaTeX renderable** (KaTeX) — the existing `aisd-content.test.js` enforces this.
6. Target per file: after edits, none of the file's questions has the correct option exceeding every distractor by a large margin.

### Worked example A — `topics/graph/floyd.js` fw6 (balance distractors)

Before (correct `[0]` is longest; distractor `[3]` tiny):
```js
options: [
  "Допускает отрицательные рёбра, но не отрицательные циклы",
  "Требует строго неотрицательных весов (как Дейкстра)",
  "Работает с любыми весами, включая отрицательные циклы",
  "Требует целочисленных весов",
],
correct: [0],
```
After (distractors grown to plausible, comparable-length claims; key unchanged):
```js
options: [
  "Допускает отрицательные рёбра, но не отрицательные циклы",
  "Требует строго неотрицательных весов, как алгоритм Дейкстры",
  "Работает при любых весах, в том числе с отрицательными циклами",
  "Требует целочисленных весов и неориентированного графа",
],
correct: [0],
```

### Worked example B — `topics/str/aho.js` ah2 (trim correct + grow distractors)

Before (correct `[0]` = 143 visual chars vs distractors 21/27/24):
```js
options: [
  "Переход в узел, соответствующий наибольшему собственному суффиксу текущей строки, который сам является узлом бора (префиксом какого-то образца)",
  "Ссылка на корень бора",
  "Ссылка на родительский узел",
  "Ссылка на ближайший лист",
],
correct: [0],
```
After (correct trimmed; justification already lives in `explain`; distractors become real competing notions):
```js
options: [
  "Переход в узел наибольшего собственного суффикса, являющегося узлом бора",
  "Переход в корень бора при любом несовпадении очередного символа",
  "Переход в родительский узел текущего состояния автомата",
  "Переход в ближайший терминальный (конечный) узел поддерева",
],
correct: [0],
```

### Worked example C — `topics/para/complexity.js` cx4 (balance)

Before (correct `[0]` = 139 vs 45/22/18):
```js
options: [
  "P — задачи, решаемые за полином; NP — задачи, решение которых проверяется за полином; $P\\subseteq NP$, а равенство $P=NP$ — открытый вопрос",
  "NP — это задачи, нерешаемые ни за какое время",
  "P и NP не пересекаются",
  "NP строго меньше P",
],
correct: [0],
```
After:
```js
options: [
  "P решаются за полином, NP проверяются за полином; $P\\subseteq NP$, равенство открыто",
  "NP — задачи, не решаемые ни за какое конечное время ни одной машиной",
  "P и NP не пересекаются: проверяемое за полином нельзя решить за полином",
  "$NP\\subsetneq P$, поэтому любая NP-задача решается за полином",
],
correct: [0],
```

---

## File Structure

- **Create:** `test/aisd-answer-quality.test.js` — guardrail test (length tell, multi-select count, hard-question count).
- **Modify:** all 15 files under `api/_data/aisd/topics/{graph,str,para}/*.js` — balance offender option lengths; add hard questions.
- **Unchanged:** `api/_data/aisd/questions.js`, `flashcards.js`, `formulas.js`, `manifest.js`, `glossary.js`, and the runtime (`src/lib/quiz.js`, `src/screens/Quiz.jsx`) — the shuffle already handles positions.

Each topic file is one task: balance its offenders + add one hard question + re-test.

---

### Task 1: Guardrail test for answer quality

**Files:**
- Create: `test/aisd-answer-quality.test.js`

- [ ] **Step 1: Write the guardrail test**

```js
import { describe, it, expect } from 'vitest'
import { QUESTIONS } from '../api/_data/aisd/questions.js'

// Нормализованная «визуальная» длина варианта: убираем доллары, каждую
// LaTeX-команду считаем за 1 глиф, скобки/пробелы схлопываем. Это приближает
// длину отрендеренного варианта, по которой студент может «угадать».
function visualLen(s) {
  return s
    .replace(/\$/g, '')
    .replace(/\\[a-zA-Z]+/g, 'x')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim().length
}

const single = QUESTIONS.filter((q) => !q.multi)

describe('aisd answer quality — нет «угадывания по длине»', () => {
  it('правильный вариант редко является самым длинным (≤ 35%)', () => {
    let uniqueLongest = 0
    const bad = []
    for (const q of single) {
      const lens = q.options.map(visualLen)
      const ci = q.correct[0]
      const mx = Math.max(...lens)
      if (lens[ci] === mx && lens.filter((l) => l === mx).length === 1) {
        uniqueLongest++
        bad.push(q.id)
      }
    }
    const frac = uniqueLongest / single.length
    expect(frac, `correct-самый-длинный у: ${bad.join(', ')}`).toBeLessThanOrEqual(0.35)
  })

  it('средняя длина правильного варианта не раздута (отношение ≤ 1.15)', () => {
    let sumC = 0, sumD = 0, nD = 0
    for (const q of single) {
      const lens = q.options.map(visualLen)
      const ci = q.correct[0]
      sumC += lens[ci]
      lens.forEach((l, i) => { if (i !== ci) { sumD += l; nD++ } })
    }
    const ratio = (sumC / single.length) / (sumD / nD)
    expect(ratio, `отношение средних длин ${ratio.toFixed(3)}`).toBeLessThanOrEqual(1.15)
  })

  it('мало вопросов с большим отрывом правильного по длине (> 18 глифов): ≤ 12%', () => {
    let severe = 0
    const bad = []
    for (const q of single) {
      const lens = q.options.map(visualLen)
      const ci = q.correct[0]
      const maxDistractor = Math.max(...lens.filter((_, i) => i !== ci))
      if (lens[ci] - maxDistractor > 18) { severe++; bad.push(q.id) }
    }
    expect(severe / single.length, `сильный отрыв у: ${bad.join(', ')}`).toBeLessThanOrEqual(0.12)
  })

  it('добавлены вопросы с множественным выбором (≥ 5)', () => {
    const multi = QUESTIONS.filter((q) => q.multi)
    expect(multi.length).toBeGreaterThanOrEqual(5)
    for (const q of multi) {
      expect(q.correct.length, `multi ${q.id} должен иметь ≥2 верных`).toBeGreaterThanOrEqual(2)
    }
  })

  it('достаточно сложных вопросов (difficulty 3 ≥ 45)', () => {
    const hard = QUESTIONS.filter((q) => q.difficulty === 3)
    expect(hard.length).toBeGreaterThanOrEqual(45)
  })
})
```

- [ ] **Step 2: Run it to confirm it fails on the current bank**

Run: `npx vitest run test/aisd-answer-quality.test.js`
Expected: FAIL — first test reports ~73% correct-is-longest; multi-select test reports 0; difficulty-3 test reports 36.

- [ ] **Step 3: Commit the guardrail**

```bash
git add test/aisd-answer-quality.test.js
git commit -m "test(aisd): add answer-quality guardrail (length tell, multi, difficulty)"
```

---

### Task 2: Balance `topics/graph/floyd.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/graph/floyd.js`

- [ ] **Step 1: Balance offenders fw6, fw8, fw9**

Apply Transformation Rules. fw6 — use Worked Example A verbatim. For fw8 and fw9, grow the short distractors into plausible near-misses comparable in length to the correct option, and trim the correct option's option-text (keep justification in `explain`). Keep each `correct` array unchanged.

- [ ] **Step 2: Add a difficulty-3 trace question with near-miss numeric distractors**

Add this object to the `questions` array (numbers verified against the file's reference run — final matrix row 1 is `[0,3,5,6]`):

```js
{
  id: "fw10", topic: "graph", difficulty: 3,
  figure: "fw_matrix_steps", figureCaption: "Итоговая матрица кратчайших расстояний",
  q: "Для эталонного графа найдите итоговое кратчайшее расстояние $d_{13}$ (из вершины 1 в вершину 3).",
  options: ["$5$", "$6$", "$7$", "$\\infty$"],
  correct: [0], multi: false,
  explain: "Прямого ребра $1\\to3$ нет. Кратчайший маршрут $1\\to2\\to3=3+2=5$. Через вершину 2 на шаге $k=2$ получаем $d_{13}=5$; дальнейшие шаги не улучшают.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; `aisd-answer-quality` still FAIL overall (other files not yet fixed) but the floyd ids no longer appear in the failure id lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/graph/floyd.js
git commit -m "content(aisd): balance floyd option lengths + add trace question"
```

---

### Task 3: Balance `topics/graph/flow.js` + add 1 multi-select question

**Files:**
- Modify: `api/_data/aisd/topics/graph/flow.js`

- [ ] **Step 1: Balance offenders mf1, mf3, mf5, mf7, mf8, mf9**

Apply Transformation Rules to each. Grow short distractors into plausible competing claims (e.g. for mf3 the three identical-length `c=…` distractors should state *different plausible cuts* with comparable length; for mf8/mf9 trim the correct option and lengthen distractors).

- [ ] **Step 2: Add a multi-select question (tests real understanding, length-immune)**

```js
{
  id: "mf10", topic: "graph", difficulty: 3, multi: true,
  q: "Выберите ВСЕ верные утверждения о максимальном потоке в сети с целыми пропускными способностями.",
  options: [
    "Величина максимального потока равна пропускной способности минимального разреза",
    "Существует максимальный поток с целыми значениями на всех рёбрах",
    "Эдмондс–Карп имеет сложность $O(VE^2)$ независимо от величины потока",
    "Наивный Форд–Фалкерсон всегда полиномиален по размеру входа",
  ],
  correct: [0, 1, 2],
  explain: "Первые три — это теорема max-flow/min-cut, теорема о целочисленности и оценка Эдмондса–Карпа. Последнее неверно: наивный Форд–Фалкерсон зависит от $|f^*|$ и не полиномиален по длине записи ёмкостей.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; flow ids gone from `aisd-answer-quality` length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/graph/flow.js
git commit -m "content(aisd): balance flow option lengths + add multi-select"
```

---

### Task 4: Balance `topics/graph/matching.js` + add 1 multi-select question

**Files:**
- Modify: `api/_data/aisd/topics/graph/matching.js`

- [ ] **Step 1: Balance offenders pm1, pm2, pm3, pm4, pm5, pm7, pm8, pm9**

Apply Transformation Rules. pm5 currently has tiny numeric distractors (`3` vs `3,3,3` lengths) — that is acceptable for a numeric question and the guardrail tolerates a few; focus length-balancing on the prose questions (pm1, pm3, pm7, pm8, pm9).

- [ ] **Step 2: Add a multi-select question**

```js
{
  id: "pm10", topic: "graph", difficulty: 3, multi: true,
  q: "Выберите ВСЕ утверждения, верные для двудольных графов.",
  options: [
    "Паросочетание наибольшее тогда и только тогда, когда нет увеличивающего пути",
    "Размер наибольшего паросочетания равен размеру наименьшего вершинного покрытия",
    "Хопкрофт–Карп находит наибольшее паросочетание за $O(E\\sqrt V)$",
    "Любое максимальное по включению паросочетание является наибольшим",
  ],
  correct: [0, 1, 2],
  explain: "Первые три — критерий Бержа, теорема Кёнига и оценка Хопкрофта–Карпа. Последнее неверно: максимальное по включению паросочетание может быть меньше наибольшего.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; matching prose ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/graph/matching.js
git commit -m "content(aisd): balance matching option lengths + add multi-select"
```

---

### Task 5: Balance `topics/graph/coloring.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/graph/coloring.js`

- [ ] **Step 1: Balance offenders gc1, gc3, gc4, gc5, gc9**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 computation question with near-miss distractors**

```js
{
  id: "gc10", topic: "graph", difficulty: 3,
  q: "Сколько существует правильных раскрасок дерева на $4$ вершинах в $3$ цвета? ($P(T,k)=k(k-1)^{n-1}$.)",
  options: ["$24$", "$12$", "$18$", "$81$"],
  correct: [0], multi: false,
  explain: "$P(T,3)=3\\cdot(3-1)^{4-1}=3\\cdot2^3=3\\cdot8=24$. (Вариант 81 — это $3^4$, раскраски без ограничений; 18 — для цикла $C_4$.)",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; coloring ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/graph/coloring.js
git commit -m "content(aisd): balance coloring option lengths + add computation question"
```

---

### Task 6: Balance `topics/str/exact.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/str/exact.js`

- [ ] **Step 1: Balance offenders ex2, ex4, ex7, ex9**

Apply Transformation Rules. ex9's distractors are short complexities (`O(n+m)` etc.) — grow them by appending the regime (e.g. "в среднем"/"в худшем случае") so all four read at comparable length.

- [ ] **Step 2: Add a difficulty-3 trace question (prefix function, near-miss vectors)**

```js
{
  id: "ex10", topic: "str", difficulty: 3,
  q: "Чему равна префикс-функция $\\pi$ образца $P=\\text{AABAA}$ (по позициям $1..5$)?",
  options: ["$[0,1,0,1,2]$", "$[0,1,0,1,1]$", "$[0,0,1,1,2]$", "$[0,1,2,0,1]$"],
  correct: [0], multi: false,
  explain: "$\\pi[1]=0$; $\\pi[2]=1$ (AA); $\\pi[3]=0$ (AAB); $\\pi[4]=1$ (AABA: «A»); $\\pi[5]=2$ (AABAA: «AA»). Итог $[0,1,0,1,2]$.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; exact ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/str/exact.js
git commit -m "content(aisd): balance exact-match options + add prefix-function trace"
```

---

### Task 7: Balance `topics/str/edit.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/str/edit.js`

- [ ] **Step 1: Balance offenders ed1, ed2, ed6, ed7, ed8**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 trace question with near-miss numeric distractors**

```js
{
  id: "ed9", topic: "str", difficulty: 3,
  q: "Чему равно расстояние Левенштейна между «KITTEN» и «SITTING»?",
  options: ["$3$", "$2$", "$4$", "$5$"],
  correct: [0], multi: false,
  explain: "KITTEN→SITTEN (замена K→S), SITTEN→SITTIN (замена E→I), SITTIN→SITTING (вставка G): три операции. ДП-таблица даёт $D[6][7]=3$.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; edit ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/str/edit.js
git commit -m "content(aisd): balance edit-distance options + add Levenshtein trace"
```

---

### Task 8: Balance `topics/str/aho.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/str/aho.js`

- [ ] **Step 1: Balance offenders ah2, ah3, ah4, ah5, ah6, ah7**

Apply Transformation Rules. ah2 — use Worked Example B verbatim. ah3's distractors are short node names; grow them to "Узлу, соответствующему строке «…»" form for comparable length.

- [ ] **Step 2: Add a difficulty-3 fail-link trace question**

```js
{
  id: "ah8", topic: "str", difficulty: 3,
  figure: "aho_trie", figureCaption: "Бор {he, she, his, hers} с fail-ссылками",
  q: "Для набора {he, she, his, hers} чему равна fail-ссылка узла, соответствующего строке «hers»?",
  options: [
    "Узлу «s» (дочернему узлу корня)",
    "Узлу «he» (как у «she»)",
    "Корню бора",
    "Узлу «hers» самому себе",
  ],
  correct: [0], multi: false,
  explain: "Собственные суффиксы «hers»: «ers», «rs», «s». Наибольший, являющийся узлом бора, — «s» (root→s). Значит $fail(\\text{«hers»})=\\text{«s»}$.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; aho ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/str/aho.js
git commit -m "content(aisd): balance Aho-Corasick options + add fail-link trace"
```

---

### Task 9: Balance `topics/str/strsort.js` + add 1 multi-select question

**Files:**
- Modify: `api/_data/aisd/topics/str/strsort.js`

- [ ] **Step 1: Balance offenders ss1, ss2, ss3, ss4, ss5, ss7**

Apply Transformation Rules. These have very long correct options (ss3=164, ss7=174 raw) — trim the correct option aggressively, push detail to `explain`, and grow distractors.

- [ ] **Step 2: Add a multi-select question**

```js
{
  id: "ss8", topic: "str", difficulty: 3, multi: true,
  q: "Выберите ВСЕ верные утверждения о специализированных сортировках строк.",
  options: [
    "MSD radix распределяет строки по корзинам, начиная со старшего символа",
    "3-way string quicksort работает почти на месте и эффективен при общих префиксах",
    "Учёт LCP избавляет от повторного сравнения совпавших префиксов",
    "LSD radix может завершаться раньше на различающихся префиксах",
  ],
  correct: [0, 1, 2],
  explain: "Первые три верны. Последнее неверно: ранний выход на различающихся префиксах — свойство MSD, а LSD обрабатывает все позиции с младшего символа.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; strsort ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/str/strsort.js
git commit -m "content(aisd): balance string-sort options + add multi-select"
```

---

### Task 10: Balance `topics/str/coding.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/str/coding.js`

- [ ] **Step 1: Balance offenders cd2, cd3, cd4, cd6, cd8, cd9**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 Huffman computation question**

```js
{
  id: "cd10", topic: "str", difficulty: 3,
  figure: "cd_huffman", figureCaption: "Дерево Хаффмана A:5 B:2 C:1 D:1",
  q: "Для частот A:5, B:2, C:1, D:1 чему равна средняя длина кода Хаффмана (бит/символ)?",
  options: [
    "$\\approx1.67$",
    "$\\approx2.00$",
    "$\\approx1.50$",
    "$\\approx1.33$",
  ],
  correct: [0], multi: false,
  explain: "Объём $15$ бит на $9$ символов: $15/9\\approx1.67$ бит/символ. (Вариант 2.00 — фиксированный 2-битный код.)",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; coding ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/str/coding.js
git commit -m "content(aisd): balance coding options + add Huffman computation"
```

---

### Task 11: Balance `topics/para/greedy.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/para/greedy.js`

- [ ] **Step 1: Balance offenders gr1, gr2, gr3, gr5, gr6**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 "which is FALSE" question (length-immune)**

```js
{
  id: "gr7", topic: "para", difficulty: 3,
  q: "Какое утверждение о жадных алгоритмах НЕВЕРНО?",
  options: [
    "Жадный алгоритм оптимален для дискретного рюкзака 0/1",
    "Жадный алгоритм оптимален для дробного рюкзака",
    "Оптимальность жадности доказывают аргументом обмена",
    "На матроиде жадный алгоритм находит оптимум для линейной функции",
  ],
  correct: [0], multi: false,
  explain: "Неверно именно первое: для рюкзака 0/1 жадность по $v_i/w_i$ может ошибаться, нужно ДП. Остальные три утверждения верны.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; greedy ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/greedy.js
git commit -m "content(aisd): balance greedy options + add which-is-false question"
```

---

### Task 12: Balance `topics/para/dp.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/para/dp.js`

- [ ] **Step 1: Balance offenders dp1, dp2, dp3, dp6, dp7**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 knapsack trace question with near-miss numbers**

Numbers verified against the file's reference DP table (`dp[3][7]=9`, `dp[2][7]=5`):

```js
{
  id: "dp8", topic: "para", difficulty: 3,
  figure: "dp_knapsack", figureCaption: "ДП-таблица рюкзака 0/1",
  q: "Эталонный рюкзак (предметы $(1,1),(3,4),(4,5),(5,7)$, $W=7$). Какова максимальная ценность, если предмет $(5,7)$ запрещён к использованию?",
  options: ["$9$", "$7$", "$8$", "$6$"],
  correct: [0], multi: false,
  explain: "Без предмета $(5,7)$ оптимум по-прежнему $(3,4)+(4,5)$: вес $7$, ценность $9$ (строка $dp[3][7]=9$ в таблице).",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; dp ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/dp.js
git commit -m "content(aisd): balance dp options + add knapsack trace question"
```

---

### Task 13: Balance `topics/para/branch.js` + add 1 multi-select question

**Files:**
- Modify: `api/_data/aisd/topics/para/branch.js`

- [ ] **Step 1: Balance offenders bb1, bb2, bb3, bb4, bb5, bb6**

Apply Transformation Rules.

- [ ] **Step 2: Add a multi-select question**

```js
{
  id: "bb7", topic: "para", difficulty: 3, multi: true,
  q: "Выберите ВСЕ верные утверждения о методе ветвей и границ.",
  options: [
    "Узел отсекается, если его граница не превосходит текущего рекорда",
    "Для рюкзака верхнюю границу даёт дробная релаксация",
    "Найденное решение является точным оптимумом",
    "Метод гарантирует полиномиальное время для NP-трудных задач",
  ],
  correct: [0, 1, 2],
  explain: "Первые три верны. Последнее неверно: в худшем случае ветви и границы экспоненциальны; отсечения ускоряют практику, но полиномиальной гарантии нет.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; branch ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/branch.js
git commit -m "content(aisd): balance branch-and-bound options + add multi-select"
```

---

### Task 14: Balance `topics/para/approx.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/para/approx.js`

- [ ] **Step 1: Balance offenders ap1, ap2, ap3, ap4, ap5, ap6**

Apply Transformation Rules. ap3 — see Worked Example C style for the P/NP file; here trim the correct PTAS definition and grow the distractors into plausible wrong scheme definitions.

- [ ] **Step 2: Add a difficulty-3 "which is FALSE" question**

```js
{
  id: "ap7", topic: "para", difficulty: 3,
  q: "Какое утверждение о схемах аппроксимации НЕВЕРНО?",
  options: [
    "PTAS полиномиальна и по $n$, и по $1/\\varepsilon$ одновременно",
    "FPTAS полиномиальна и по $n$, и по $1/\\varepsilon$",
    "Рюкзак 0/1 допускает FPTAS",
    "PTAS даёт $(1+\\varepsilon)$-приближение за полином по $n$ при фиксированном $\\varepsilon$",
  ],
  correct: [0], multi: false,
  explain: "Неверно первое: именно у FPTAS (а не PTAS) время полиномиально по $1/\\varepsilon$. В PTAS зависимость от $1/\\varepsilon$ может быть экспоненциальной.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; approx ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/approx.js
git commit -m "content(aisd): balance approximation options + add which-is-false"
```

---

### Task 15: Balance `topics/para/random.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/para/random.js`

- [ ] **Step 1: Balance offenders rd1, rd2, rd3, rd4, rd5, rd6**

Apply Transformation Rules.

- [ ] **Step 2: Add a difficulty-3 probability computation question**

```js
{
  id: "rd7", topic: "para", difficulty: 3,
  q: "Нижняя оценка вероятности успеха одного запуска алгоритма Каргера для графа из $n=4$ вершин равна:",
  options: ["$1/6$", "$1/4$", "$1/12$", "$1/2$"],
  correct: [0], multi: false,
  explain: "$\\frac{2}{n(n-1)}=\\frac{2}{4\\cdot3}=\\frac{2}{12}=\\frac16$, что равно $\\binom{4}{2}^{-1}$.",
},
```

- [ ] **Step 3: Run content + quality tests**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js`
Expected: `aisd-content` PASS; random ids gone from length-failure lists.

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/random.js
git commit -m "content(aisd): balance randomized-algo options + add probability question"
```

---

### Task 16: Balance `topics/para/complexity.js` + add 1 hard question

**Files:**
- Modify: `api/_data/aisd/topics/para/complexity.js`

- [ ] **Step 1: Balance offenders cx1, cx2, cx4, cx5, cx6, cx7, cx8, cx9**

Apply Transformation Rules. cx4 — use Worked Example C verbatim.

- [ ] **Step 2: Add a multi-select question**

```js
{
  id: "cx10", topic: "para", difficulty: 3, multi: true,
  q: "Выберите ВСЕ верные утверждения теории сложности.",
  options: [
    "$A\\le_p B$ и $B\\in P$ влечёт $A\\in P$",
    "SAT NP-полна (теорема Кука–Левина)",
    "Проблема остановки неразрешима",
    "Всякая NP-трудная задача принадлежит NP",
  ],
  correct: [0, 1, 2],
  explain: "Первые три верны. Последнее неверно: NP-трудная задача не обязана лежать в NP (например оптимизационная или неразрешимая).",
},
```

- [ ] **Step 3: Run all three aisd tests — expect FULL pass now**

Run: `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js test/registry.test.js`
Expected: ALL PASS. `aisd-answer-quality`: correct-is-longest ≤ 35%, ratio ≤ 1.15, severe-gap ≤ 12%, multi-select ≥ 5 (now 5: mf10, pm10, ss8, bb7, cx10), difficulty-3 ≥ 45 (now 51 = 36 + 15 new).

- [ ] **Step 4: Commit**

```bash
git add api/_data/aisd/topics/para/complexity.js
git commit -m "content(aisd): balance complexity options + add multi-select"
```

---

### Task 17: Full suite + production build

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite**

Run: `npx vitest run`
Expected: ALL PASS (content, answer-quality, registry, and the existing finance/matstat suites).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `✓ built in …` with no errors.

- [ ] **Step 3: If anything fails, fix inline and re-run** before proceeding to agent re-validation.

---

### Task 18: Correctness re-audit by agents (per user instruction)

Length-balancing rewrote distractors — the risk is that a reworded distractor is now *also true*, or a trimmed correct option is now ambiguous. Dispatch one reviewer agent per section to re-audit ONLY this risk plus the new questions.

- [ ] **Step 1: Dispatch three agents (one per section), each given the section's files**

For each section (graph: floyd/flow/matching/coloring; str: exact/edit/aho/strsort/coding; para: greedy/dp/branch/approx/random/complexity), dispatch a `general-purpose` agent with this instruction:

> You are a strict algorithms-correctness reviewer. For each question in these files (paths listed), independently determine the correct answer(s) from scratch — do NOT trust the marked `correct`. Then specifically check: (1) does any distractor now read as ALSO correct (ambiguous question)? (2) is the marked `correct` still the right index/indices after the recent option rewrites? (3) for multi-select questions, is the `correct` set exactly the true subset? (4) are all newly added questions (ids fwX/mfX/pmX/gcX/exX/edX/ahX/ssX/cdX/grX/dpX/bbX/apX/rdX/cxX with the highest numbers) correct, including any numeric traces? Report ONLY problems: file, question id, what's wrong, the fix. If all correct, say so per file. Do not edit files.

- [ ] **Step 2: Apply any fixes the agents flag**

For each reported problem, edit the relevant file. Re-run `npx vitest run test/aisd-content.test.js test/aisd-answer-quality.test.js` after fixes. If a fix changes an option's length, confirm the quality guardrail still passes.

- [ ] **Step 3: Commit any fixes**

```bash
git add api/_data/aisd/topics
git commit -m "fix(aisd): correctness fixes from post-balancing audit"
```

---

### Task 19: Push and update PR / redeploy

**Files:** none

- [ ] **Step 1: Push the branch**

Run: `git push origin feature/matstat-exam-prep`
Expected: push succeeds; PR #3 updates automatically.

- [ ] **Step 2: (Optional, if the user wants it live) redeploy to Vercel**

Run: `vercel --prod --yes`
Expected: `readyState: READY`, `target: production`. Report the URL.

---

## Self-Review notes (already applied)

- **Spec coverage:** length tell → guardrail test + Tasks 2–16; harder questions → one new question per file = 15 total (5 multi-select: mf10/pm10/ss8/bb7/cx10; 2 "which is FALSE": gr7/ap7; 8 numeric traces: fw10/gc10/ex10/ed9/ah8/cd10/dp8/rd7), enforced by guardrail metrics 4–5; "validate every card" → `aisd-content.test.js` runs in every task; "run agents after changes" → Task 18.
- **Position tell:** intentionally NOT addressed in data — proven neutralized by `withShuffledOptions` (`src/lib/quiz.js:29`, used in `src/screens/Quiz.jsx:72,191`). Documented to prevent wasted, risky reindexing work.
- **New-question id collisions:** new ids (fw10, mf10, pm10, gc10, ex10, ed9, ah8, ss8, cd10, gr7, dp8, bb7, ap7, rd7, cx10) extend each file's existing max id; `aisd-content.test.js` asserts id uniqueness and will catch any clash.
- **Numeric correctness:** every new numeric trace (fw10 d₁₃=5, gc10=24, ex10 π, ed9=3, dp8=9, rd7=1/6, cd10≈1.67) was derived against the reference values already embedded in each file's header comment.
