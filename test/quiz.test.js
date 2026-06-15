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
