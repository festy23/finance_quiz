import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import katex from 'katex'
import { QUESTIONS, TOPICS } from '../api/_data/aisd/questions.js'
import { FLASHCARDS } from '../api/_data/aisd/flashcards.js'
import { FORMULAS } from '../api/_data/aisd/formulas.js'
import { GLOSSARY } from '../api/_data/aisd/glossary.js'
import { TICKETS } from '../api/_data/aisd/tickets.js'
import { splitMath } from '../src/lib/mathtext.js'

const TOPIC_IDS = new Set(TOPICS.map((t) => t.id))
const FIG_DIR = path.resolve('public/figures/aisd')

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

describe('aisd content bank', () => {
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

  it('все термины словаря ссылаются на существующую тему', () => {
    for (const g of GLOSSARY) {
      expect(TOPIC_IDS.has(g.topic), `словарь «${g.t}» → несуществующая тема ${g.topic}`).toBe(true)
    }
  })

  it('id уникальны в каждом массиве', () => {
    for (const [name, arr] of [['Q', QUESTIONS], ['F', FLASHCARDS], ['FM', FORMULAS]]) {
      const ids = arr.map((x) => x.id)
      expect(new Set(ids).size, `дубли id в ${name}`).toBe(ids.length)
    }
  })

  it('билеты (fast review): 15 штук, валидная схема, фигуры существуют', () => {
    expect(TICKETS.length, 'ожидалось 15 билетов').toBe(15)
    const ids = TICKETS.map((t) => t.id)
    const refs = TICKETS.map((t) => t.ref)
    expect(new Set(ids).size, 'дубли id билетов').toBe(ids.length)
    expect(new Set(refs).size, 'дубли ref билетов').toBe(refs.length)
    for (const t of TICKETS) {
      expect(TOPIC_IDS.has(t.topic), `тема ${t.topic} у билета ${t.id}`).toBe(true)
      expect(typeof t.title === 'string' && t.title.length > 0, `title у ${t.id}`).toBe(true)
      expect(Array.isArray(t.blocks) && t.blocks.length > 0, `blocks у ${t.id}`).toBe(true)
      for (const b of t.blocks) {
        // блок — либо текст (body), либо преформатированный (pre), но не пусто
        expect(b.body != null || b.pre != null, `пустой блок в ${t.id}`).toBe(true)
      }
      for (const f of t.figures || []) {
        expect(figExists(f.name), `нет figure ${f.name} у билета ${t.id}`).toBe(true)
      }
    }
  })
})
