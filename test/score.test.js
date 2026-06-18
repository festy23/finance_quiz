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
