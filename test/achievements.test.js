import { describe, it, expect } from 'vitest'
import { buildMetrics, buildAchievements } from '../src/lib/achievements.js'

const topics = [{ id: 'a' }, { id: 'b' }]
const stats = {
  a: { answered: 6, correct: 5, mastery: 50 },
  b: { answered: 4, correct: 4, mastery: 80 },
}
const attempts = [{ score: 5, total: 5 }, { score: 2, total: 5 }]

describe('achievements', () => {
  it('buildMetrics агрегирует totals/accuracy/perfect', () => {
    const m = buildMetrics({ stats, topics, attempts, bestStreak: 4 })
    expect(m.totalAnswered).toBe(10)
    expect(m.totalCorrect).toBe(9)
    expect(m.accuracy).toBe(90)
    expect(m.perfectMaxSize).toBe(5)
    expect(m.bestStreak).toBe(4)
    expect(m.masteryByTopic.b).toBe(80)
  })

  it('buildAchievements оценивает каждое правило', () => {
    const defs = [
      { id: 'first', rule: { kind: 'attempts', n: 1 } },
      { id: 'ten', rule: { kind: 'totalAnswered', n: 50 } },
      { id: 'ace', rule: { kind: 'accuracy', n: 10, pct: 90 } },
      { id: 'perfect', rule: { kind: 'perfectSession', size: 5 } },
      { id: 'streak', rule: { kind: 'streak', days: 3 } },
      { id: 'tmA', rule: { kind: 'topicMastery', topic: 'a', pct: 50 } },
      { id: 'tmB', rule: { kind: 'topicMastery', topic: 'b', pct: 90 } },
      { id: 'all', rule: { kind: 'allTopicsMastery', pct: 60 } },
    ]
    const got = Object.fromEntries(
      buildAchievements(defs, buildMetrics({ stats, topics, attempts, bestStreak: 4 })).map((a) => [a.id, a.got])
    )
    expect(got).toEqual({
      first: true, ten: false, ace: true, perfect: true,
      streak: true, tmA: true, tmB: false, all: false,
    })
  })
})
