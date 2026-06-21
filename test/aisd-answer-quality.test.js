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
