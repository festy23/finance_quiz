// template.typ — единый стиль шпаргалки «АиСД fast».
// Светлая страница + тёмные SVG-фигуры в карточках (как Figure.jsx в приложении).
// Все part-файлы делают:  #import "../template.typ": *

#let ACCENT   = rgb("#6366f1") // акцент квиза aisd
#let INK      = rgb("#1f2430")
#let MUTE     = rgb("#6b7385")
#let LINE     = rgb("#e3e6ee")
#let PANEL_BG = rgb("#0b0d12") // фон тёмных фигур
#let PANEL_TX = rgb("#c9d1e0")

// ───────────────────────── палитра рубрик ─────────────────────────
#let C = (
  task:  rgb("#64748b"), // Постановка
  idea:  rgb("#6366f1"), // Идея
  algo:  rgb("#0ea5e9"), // Алгоритм
  thm:   rgb("#16a34a"), // Теорема / Корректность
  sketch:rgb("#0d9488"), // Идея доказательства
  proof: rgb("#7c3aed"), // Строгое доказательство
  cx:    rgb("#d97706"), // Сложность
  lim:   rgb("#dc2626"), // Ограничения
  ex:    rgb("#db2777"), // Пример
  tip:   rgb("#e11d48"), // На экзамене
)

// ───────────────────────── базовая рубрика ─────────────────────────
#let rubric(label, color, body) = block(
  width: 100%,
  inset: (left: 9pt, rest: 7pt),
  radius: 4pt,
  fill: color.lighten(92%),
  stroke: (left: 2.4pt + color, rest: 0.4pt + color.lighten(55%)),
  spacing: 6pt,
  [
    #text(size: 8pt, weight: 700, tracking: 0.4pt, fill: color.darken(8%))[#upper(label)]
    #v(2pt, weak: true)
    #set text(size: 9.4pt, fill: INK)
    #body
  ],
)

// именованные обёртки
#let task(body)   = rubric("Постановка", C.task, body)
#let idea(body)   = rubric("Идея", C.idea, body)
#let algo(body)   = rubric("Алгоритм", C.algo, body)
#let thm(body)    = rubric("Теорема · корректность", C.thm, body)
#let sketch(body) = rubric("Идея доказательства", C.sketch, body)
#let proof(body)  = rubric("Строгое доказательство", C.proof, body)
#let cx(body)     = rubric("Сложность", C.cx, body)
#let lim(body)    = rubric("Ограничения применимости", C.lim, body)
#let ex(body)     = rubric("Пример", C.ex, body)
#let tip(body)    = rubric("На экзамене", C.tip, body)

// ───────────────────────── карточка с тёмной фигурой ─────────────────────────
// SVG лежат в public/figures/aisd/<name>.svg (тёмный фон). Рисуем их в тёмной панели.
#let figcard(name, caption, w: 78%) = figure(
  block(
    width: 100%,
    fill: PANEL_BG,
    radius: 6pt,
    inset: 10pt,
    stroke: 0.6pt + rgb("#262a33"),
    align(center, image("../../../public/figures/aisd/" + name + ".svg", width: w)),
  ),
  caption: caption,
)

// две фигуры рядом
#let figrow(a, b, ca, cb) = grid(
  columns: (1fr, 1fr), gutter: 8pt,
  figcard(a, ca, w: 96%), figcard(b, cb, w: 96%),
)

// ───────────────────────── заголовок билета ─────────────────────────
#let SECCOLOR = (
  "Графовые алгоритмы": rgb("#6366f1"),
  "Строковые алгоритмы": rgb("#0ea5e9"),
  "Парадигмы разработки": rgb("#16a34a"),
)
#let ticket(section, num, title, body) = {
  let col = SECCOLOR.at(section, default: ACCENT)
  pagebreak(weak: true)
  // невидимый заголовок — только для оглавления и закладок PDF
  [#heading(level: 1, outlined: true, bookmarked: true)[Билет #num. #title]]
  block(
    width: 100%, above: 0pt, below: 10pt,
    inset: (x: 12pt, y: 9pt), radius: 6pt,
    fill: col.lighten(86%),
    stroke: (left: 4pt + col),
    [
      #text(size: 8.5pt, weight: 700, tracking: 0.6pt, fill: col.darken(10%))[#upper(section) · БИЛЕТ #num]
      #v(1pt, weak: true)
      #text(size: 14pt, weight: 800, fill: INK)[#title]
    ],
  )
  body
}

// маленькая «шпаргалка-факт» внутри текста
#let kbd(b) = box(inset: (x: 3pt), outset: (y: 2pt), radius: 2pt, fill: rgb("#f1f3f9"), stroke: 0.4pt + LINE, text(size: 8.5pt, font: "DejaVu Sans Mono", b))

// разделитель внутри билета (тонкая линия)
#let hr = line(length: 100%, stroke: 0.5pt + LINE)

// ───────────────────────── глобальная конфигурация ─────────────────────────
#let conf(doc) = {
  set page(
    paper: "a4",
    margin: (x: 1.6cm, top: 1.7cm, bottom: 1.5cm),
    footer: context [
      #set text(size: 8pt, fill: MUTE)
      #line(length: 100%, stroke: 0.4pt + LINE)
      #v(2pt)
      #grid(columns: (1fr, auto),
        align(left)[Алгоритмы и структуры данных · экзамен 2025–2026 · _fast review_],
        align(right)[#counter(page).display() / #context counter(page).final().first()])
    ],
  )
  set text(font: ("Libertinus Serif", "DejaVu Sans"), lang: "ru", size: 10pt, fill: INK)
  set par(justify: true, leading: 0.6em, spacing: 0.95em)
  // заголовки билетов невидимы в тексте (видна только цветная плашка), но живут в оглавлении
  show heading.where(level: 1): it => []
  set list(marker: ([•], [–]), indent: 2pt, body-indent: 5pt, spacing: 0.5em)
  set enum(indent: 2pt, body-indent: 5pt, spacing: 0.5em)
  // моноширинный для кода/строк
  show raw: set text(font: "DejaVu Sans Mono", size: 8.6pt)
  set math.equation(numbering: none)
  doc
}
