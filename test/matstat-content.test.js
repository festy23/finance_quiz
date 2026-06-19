import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import katex from 'katex'
import { QUESTIONS, TOPICS } from '../api/_data/matstat/questions.js'
import { FLASHCARDS } from '../api/_data/matstat/flashcards.js'
import { FORMULAS } from '../api/_data/matstat/formulas.js'
import { GLOSSARY } from '../api/_data/matstat/glossary.js'
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
})
