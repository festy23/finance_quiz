import { describe, it, expect } from 'vitest'
import { buildStore } from '../api/progress.js'

describe('buildStore', () => {
  it('reshapes db rows into the client store shape', () => {
    const store = buildStore({
      user: { id: 1, name: 'Иван', photo_url: null },
      attempts: [{ id: 'a1', mode: 'topic', topic: 'pf', score: 3, total: 5, qids: ['x'], answers: {}, spark: [100], created_at: '2026-06-10T00:00:00Z' }],
      qstatsRows: [{ question_id: 'x', seen: 2, correct: 1 }],
      wrongRows: [{ question_id: 'y' }],
      dayRows: [{ day: '2026-06-10', answered: 5 }],
      meta: { best_streak: 4, tt_best: 7 },
    })
    expect(store.user.name).toBe('Иван')
    expect(store.attempts[0].id).toBe('a1')
    expect(store.attempts[0].date).toBe(Date.parse('2026-06-10T00:00:00Z'))
    expect(store.qstats.x).toEqual({ seen: 2, correct: 1 })
    expect(store.wrong).toEqual(['y'])
    expect(store.days['2026-06-10']).toBe(5)
    expect(store.ttBest).toBe(7)
    expect(store.bestStreak).toBeGreaterThanOrEqual(4)
  })
})
