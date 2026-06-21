import { describe, it, expect } from 'vitest'
import { listQuizzes, getQuiz, DEFAULT_QUIZ } from '../api/_data/registry.js'

describe('quiz registry', () => {
  it('DEFAULT_QUIZ is finance', () => {
    expect(DEFAULT_QUIZ).toBe('finance')
  })

  it('listQuizzes returns lightweight catalog entries with counts', () => {
    const list = listQuizzes()
    const finance = list.find((q) => q.id === 'finance')
    expect(finance).toBeTruthy()
    expect(finance.title).toBeTruthy()
    expect(finance.questionCount).toBeGreaterThan(0)
    expect(finance.topicCount).toBeGreaterThan(0)
    // каталог не должен тащить тяжёлые массивы
    expect(finance.questions).toBeUndefined()
    expect(finance.glossary).toBeUndefined()
  })

  it('getQuiz returns full manifest or null', () => {
    const q = getQuiz('finance')
    expect(q.questions.length).toBeGreaterThan(0)
    expect(q.modes.full).toBeTruthy()
    expect(q.achievements.length).toBeGreaterThan(0)
    expect(getQuiz('nope')).toBeNull()
  })

  it('matstat зарегистрирован, без tradetest', () => {
    const list = listQuizzes()
    expect(list.map((q) => q.id)).toContain('matstat')
    const ms = getQuiz('matstat')
    expect(ms.features.tradetest).toBe(false)
    expect(ms.questions.length).toBeGreaterThanOrEqual(5)
    expect(ms.glossary.length).toBeGreaterThanOrEqual(10)
  })

  it('aisd зарегистрирован, флеш-карты и формулы включены, без tradetest', () => {
    const list = listQuizzes()
    expect(list.map((q) => q.id)).toContain('aisd')
    const a = getQuiz('aisd')
    expect(a.features.tradetest).toBe(false)
    expect(a.features.flashcards).toBe(true)
    expect(a.features.formulas).toBe(true)
    expect(a.topics.map((t) => t.id)).toEqual(['graph', 'str', 'para'])
    expect(a.questions.length).toBeGreaterThanOrEqual(5)
    expect(a.achievements.length).toBeGreaterThan(0)
  })
})
