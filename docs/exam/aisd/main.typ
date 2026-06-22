#import "template.typ": *
#show: conf

// ════════════════════════════ ОБЛОЖКА ════════════════════════════
#set page(footer: none)
#v(2.2cm)
#align(center)[
  #text(size: 9pt, weight: 700, tracking: 3pt, fill: ACCENT)[FAST REVIEW · ШПАРГАЛКА К УСТНОМУ ЭКЗАМЕНУ]
  #v(8pt)
  #text(size: 30pt, weight: 800, fill: INK)[Алгоритмы и структуры данных]
  #v(2pt)
  #text(size: 13pt, fill: MUTE)[Графовые · Строковые алгоритмы · Парадигмы разработки]
  #v(4pt)
  #text(size: 11pt, fill: MUTE)[Учебный год 2025–2026 · 15 билетов]
]
#v(14pt)
#block(width: 100%, inset: 12pt, radius: 6pt, fill: rgb("#f6f7fb"), stroke: 0.6pt + LINE)[
  #set text(size: 9.4pt)
  *Как устроен билет.* Каждый билет разложен по единому формату:
  #grid(columns: (1fr, 1fr), gutter: 6pt, row-gutter: 3pt,
    [#text(fill: C.task, [▍]) *Постановка* — что решаем],
    [#text(fill: C.idea, [▍]) *Идея* — ключевое наблюдение],
    [#text(fill: C.algo, [▍]) *Алгоритм* — шаги/псевдокод],
    [#text(fill: C.thm, [▍]) *Теорема · корректность*],
    [#text(fill: C.sketch, [▍]) *Идея доказательства*],
    [#text(fill: C.proof, [▍]) *Строгое доказательство* — инвариант/индукция],
    [#text(fill: C.cx, [▍]) *Сложность* $T_("wc")(n)$ с обоснованием],
    [#text(fill: C.lim, [▍]) *Ограничения* применимости],
    [#text(fill: C.ex, [▍]) *Пример* — трассировка + SVG],
    [#text(fill: C.tip, [▍]) *На экзамене* — типичные ловушки],
  )
  #v(4pt)
  Требования экзамена к ответам разделов 1–2: обоснование асимптотики $T_("wc")(n)$,
  комментарий об ограничениях применимости, пошаговая иллюстрация на примере.
]

#v(10pt)
#text(size: 12pt, weight: 700)[Содержание]
#v(3pt)
#outline(title: none, depth: 1, indent: 1.2em)

// ════════════════════════════ РАЗДЕЛЫ ════════════════════════════
#show: rest => { set page(footer: auto); rest }

#include "parts/01-graph.typ"
#include "parts/02-str.typ"
#include "parts/03-para.typ"
#include "parts/99-pnp.typ"
